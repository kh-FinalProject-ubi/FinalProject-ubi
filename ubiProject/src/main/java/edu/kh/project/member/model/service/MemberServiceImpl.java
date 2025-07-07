package edu.kh.project.member.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.mapper.MemberMapper;
import lombok.extern.slf4j.Slf4j;

@Transactional(rollbackFor = Exception.class)
@Service
@Slf4j
public class MemberServiceImpl implements MemberService {
    @Autowired
    private MemberMapper mapper;
    @Autowired
    private BCryptPasswordEncoder bcrypt;

    @Override
    public Member login(String memberId, String memberPw) {
        Member m = mapper.login(memberId);
        if (m == null) return null;

        boolean isMatch = bcrypt.matches(memberPw, m.getMemberPw());


        if (!isMatch) return null;

        m.setMemberPw(null);
        return m;
    }

    @Override
    public int signup(Member inputMember) {
        // 비밀번호 암호화
        String encryptedPw = bcrypt.encode(inputMember.getMemberPw());
        inputMember.setMemberPw(encryptedPw);

        // 회원가입 처리
        return mapper.signup(inputMember);
    }

    @Override
    public int checkEmail(String memberEmail) {
        return mapper.checkEmail(memberEmail);
    }

    @Override
    public int checkNickname(String memberNickname) {
        return mapper.checkNickname(memberNickname);
    }

    @Override
    public String createRandomCode() {
        int code = (int)(Math.random() * 900000) + 100000;
        return String.valueOf(code);
    }

    @Override
    public boolean sendAuthCodeToEmail(String email, String authCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[UBI] 회원가입 인증번호 안내");
            message.setText("인증번호: " + authCode + "\n입력창에 인증번호를 입력해주세요.");
            message.setFrom("noreply@ubi.com");
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Member kakaoLogin(String code) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. 인가 코드로 액세스 토큰 요청
            String tokenUrl = "https://kauth.kakao.com/oauth/token";
            String clientId = "b62bbea46498a09baf12fedc0a9bc832"; // 카카오 앱 REST API 키
            String redirectUri = "http://localhost:5174/oauth/kakao/callback";

            String tokenResponse = restTemplate.postForObject(
                tokenUrl +
                "?grant_type=authorization_code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&code=" + code,
                null,
                String.class
            );

            // 2. 토큰 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> tokenMap = objectMapper.readValue(tokenResponse, Map.class);
            String accessToken = (String) tokenMap.get("access_token");

            // 3. 액세스 토큰으로 사용자 정보 요청
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://kapi.kakao.com/v2/user/me", entity, String.class
            );

            // 4. 사용자 정보 파싱
            Map<String, Object> userMap = objectMapper.readValue(response.getBody(), Map.class);
            String kakaoId = String.valueOf(userMap.get("id")); // 카카오 고유 ID

            // 5. DB에서 카카오 ID로 사용자 조회
            Member member = mapper.selectByKakaoId(kakaoId);
            if (member == null) {
                // 신규 사용자는 프론트에서 회원가입 유도
                throw new RuntimeException("신규 사용자입니다. 회원가입이 필요합니다.");
            }

            return member;

        } catch (Exception e) {
            throw new RuntimeException("카카오 로그인 처리 중 오류 발생", e);
        }
    }

    private final JavaMailSender mailSender;

    public MemberServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 아이디 중복 검사
    @Override
    public boolean checkIdAvailable(String memberId) {
        return mapper.checkMemberId(memberId) == 0;
    }

    // 닉네임 중복 검사
    @Override
    public boolean checkNicknameAvailable(String memberNickname) {
        return mapper.checkNickname(memberNickname) == 0;
    }

	@Override
	public Member findByNo(Long memberNo) {
	    return mapper.selectByNo(memberNo);
	
	}
	
	// 신고하고 신고 취소하는 메서드
	public boolean reportMember(int targetMemberNo, int reporterMemberNo, String reason) {
	    // 1. 이미 신고했는지 여부 조회
	    String status = mapper.checkReportStatus(targetMemberNo, reporterMemberNo);

	    // 2. 기존 신고 수
	    int beforeCount = mapper.selectReportCount(targetMemberNo);

	    if (status == null) {
	        // 신고한 적 x -> report 테이블에 인서트 -> 멤버 신고 횟수 +1
	        mapper.insertReport(targetMemberNo, reporterMemberNo, reason);
	        mapper.increaseReportCount(targetMemberNo);

	        int afterCount = beforeCount + 1;

	        LocalDateTime now = LocalDateTime.now();
	        LocalDateTime plus5min = now.plusMinutes(5);

	        
	        // 정지 조건 판단
	        if (beforeCount == 4 && afterCount == 5) {
//	            mapper.insertSuspension(targetMemberNo, LocalDate.now(), LocalDate.now().plusDays(7));
	        	mapper.insertSuspensionTest(targetMemberNo, now, plus5min);
	        }

	        return true;

	    } else if ("Y".equals(status)) {
	        // 👉 이미 신고한 상태 → 신고 취소
	        mapper.updateReportStatus(targetMemberNo, reporterMemberNo, reason , "N");
	        mapper.decreaseReportCount(targetMemberNo);

	        int afterCount = beforeCount - 1;

	        // 정지 해제 조건 판단
	        if (beforeCount == 5 && afterCount == 4) {
	            mapper.deleteSuspension(targetMemberNo);
	        }

	        return false;

	    } else if ("N".equals(status)) {
	        // 👉 다시 신고 활성화
	        mapper.updateReportStatus(targetMemberNo, reporterMemberNo, reason , "Y");
	        mapper.increaseReportCount(targetMemberNo);

	        int afterCount = beforeCount + 1;

	        if (beforeCount == 4 && afterCount == 5) {
	            mapper.insertSuspension(targetMemberNo, LocalDate.now(), LocalDate.now().plusDays(7));
	        }

	        return true;
	    }

	    return false;
	}

}

