package edu.kh.project.member.model.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

    /** ✅ 카카오 로그인 구현 */
    @Override
    public Member kakaoLogin(String code) throws RuntimeException {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. 인가코드로 액세스 토큰 요청
            String tokenUrl = "https://kauth.kakao.com/oauth/token";
            Map<String, String> tokenRequest = Map.of(
                "grant_type", "authorization_code",
                "client_id", "b62bbea46498a09baf12fedc0a9bc832",
                "redirect_uri", "http://localhost:3000/oauth/kakao/callback",
                "code", code
            );

            String tokenResponse = restTemplate.postForObject(
                tokenUrl + "?grant_type=" + tokenRequest.get("grant_type") +
                "&client_id=" + tokenRequest.get("client_id") +
                "&redirect_uri=" + tokenRequest.get("redirect_uri") +
                "&code=" + tokenRequest.get("code"),
                null,
                String.class
            );

            ObjectMapper mapperObj = new ObjectMapper();
            Map<String, Object> tokenMap = mapperObj.readValue(tokenResponse, Map.class);
            String accessToken = (String) tokenMap.get("access_token");

            // 2. 사용자 정보 요청
            String userInfoUrl = "https://kapi.kakao.com/v2/user/me";
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<String> userResponse = restTemplate.postForEntity(userInfoUrl, entity, String.class);

            Map<String, Object> userMap = mapperObj.readValue(userResponse.getBody(), Map.class);
            String kakaoId = String.valueOf(userMap.get("id"));

            // 3. DB 조회
            Member member = mapper.selectByKakaoId(kakaoId);
            if (member == null) {
                throw new RuntimeException("신규 사용자 - 회원가입 필요");
            }

            return member;

        } catch (Exception e) {
            throw new RuntimeException("카카오 로그인 실패", e);
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
}

