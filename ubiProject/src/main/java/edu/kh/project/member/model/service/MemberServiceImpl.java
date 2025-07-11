package edu.kh.project.member.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

import edu.kh.project.board.model.mapper.CommentMapper;
import edu.kh.project.board.model.mapper.MytownBoardMapper;
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
	private CommentMapper commentMapper;

	@Autowired
	private MytownBoardMapper boardMapper;

	@Autowired
	private BCryptPasswordEncoder bcrypt;

	@Override
	public Member login(String memberId, String memberPw) {
		Member m = mapper.login(memberId);
		if (m == null)
			return null;

		boolean isMatch = bcrypt.matches(memberPw, m.getMemberPw());

		if (!isMatch)
			return null;

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
		int code = (int) (Math.random() * 900000) + 100000;
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

			String tokenResponse = restTemplate.postForObject(tokenUrl + "?grant_type=authorization_code"
					+ "&client_id=" + clientId + "&redirect_uri=" + redirectUri + "&code=" + code, null, String.class);

			// 2. 토큰 파싱
			ObjectMapper objectMapper = new ObjectMapper();
			Map<String, Object> tokenMap = objectMapper.readValue(tokenResponse, Map.class);
			String accessToken = (String) tokenMap.get("access_token");

			// 3. 액세스 토큰으로 사용자 정보 요청
			HttpHeaders headers = new HttpHeaders();
			headers.add("Authorization", "Bearer " + accessToken);
			HttpEntity<String> entity = new HttpEntity<>(headers);

			ResponseEntity<String> response = restTemplate.postForEntity("https://kapi.kakao.com/v2/user/me", entity,
					String.class);

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
	@Override
	public boolean reportMember(int targetMemberNo, int reporterMemberNo, String reason) {

		// 1. 기존 신고 상태 조회 (Y, N, null)
		String status = mapper.checkReportStatus(targetMemberNo, reporterMemberNo);
		System.out.println("신고 상태: " + status + " (null? " + (status == null) + ")");


		// 2. 기존 멤버 신고 횟수 조회
		int beforeCount = mapper.selectMemberReportCount(targetMemberNo);

		try {
			if (status == null) {
				// 신규 신고 등록
				mapper.insertReport(targetMemberNo, reporterMemberNo, reason);
				mapper.increaseMemberReportCount(targetMemberNo);

				int afterCount = beforeCount + 1;

				Map<String, String> suspension = mapper.selectSuspension(targetMemberNo);
				LocalDateTime now = LocalDateTime.now();

				// 신고 5의 배수면 정지 신규 등록 또는 연장
				if (afterCount % 5 == 0) {
					LocalDateTime newEnd = now.plusMinutes(5); // 정지 기간 (임시 5분)
					if (suspension == null) {
						// 신규 정지 등록
						mapper.insertSuspensionTest(targetMemberNo, now, newEnd);

						// ▶ 정지 발생 시 신고당한 댓글, 게시글 숨김 처리(삭제)
						List<Integer> reportedComments = commentMapper.selectAllReportComments(targetMemberNo);
						for (int commentNo : reportedComments) {
							commentMapper.delete(commentNo);
						}

						List<Integer> reportedBoards = boardMapper.selectAllReportBoards(targetMemberNo);
						for (int boardNo : reportedBoards) {
							// 게시글 작성자 번호 조회 필요
							int boardWriterNo = boardMapper.selectBoardWriterNo(boardNo);
							boardMapper.deleteBoard(boardNo, boardWriterNo);
						}

					} else {
						// 정지 기간 연장
						LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
						LocalDateTime extendedEnd = originEnd.isAfter(now) ? originEnd.plusMinutes(5) : newEnd;
						mapper.extendSuspensionEnd(targetMemberNo, extendedEnd);
					}
				}

				return true;

			} else if ("Y".equals(status)) {
				// 신고 취소
				mapper.updateReportStatus(targetMemberNo, reporterMemberNo, reason, "N");
				mapper.decreaseMemberReportCount(targetMemberNo);

				int afterCount = beforeCount - 1;

				Map<String, String> suspension = mapper.selectSuspension(targetMemberNo);

				// 신고 5의 배수 아래로 떨어졌으면 정지 해제
				if (beforeCount % 5 == 0 && suspension != null && afterCount < beforeCount) {
					mapper.deleteSuspension(targetMemberNo);

					// ▶ 정지 해제 시 신고 취소로 복구 처리
					List<Integer> reportedComments = commentMapper.selectAllReportComments(targetMemberNo);
					for (int commentNo : reportedComments) {
						commentMapper.recover(commentNo);
					}

					List<Integer> reportedBoards = boardMapper.selectAllReportBoards(targetMemberNo);
					for (int boardNo : reportedBoards) {
						boardMapper.recoverBoard(boardNo);
					}
				}

				return false;

			} else if ("N".equals(status)) {
				// 신고 재활성화
				mapper.updateReportStatus(targetMemberNo, reporterMemberNo, reason, "Y");
				mapper.increaseMemberReportCount(targetMemberNo);

				int afterCount = beforeCount + 1;

				Map<String, String> suspension = mapper.selectSuspension(targetMemberNo);
				LocalDateTime now = LocalDateTime.now();

				// 신고 5의 배수면 정지 신규 등록 또는 연장
				if (afterCount % 5 == 0) {
					LocalDateTime end = now.plusMinutes(5);
					if (suspension == null) {
						mapper.insertSuspensionTest(targetMemberNo, now, end);

						// ▶ 정지 발생 시 신고당한 댓글, 게시글 숨김 처리(삭제)
						List<Integer> reportedComments = commentMapper.selectAllReportComments(targetMemberNo);
						for (int commentNo : reportedComments) {
							commentMapper.delete(commentNo);
						}

						List<Integer> reportedBoards = boardMapper.selectAllReportBoards(targetMemberNo);
						for (int boardNo : reportedBoards) {
							int boardWriterNo = boardMapper.selectBoardWriterNo(boardNo);
							boardMapper.deleteBoard(boardNo, boardWriterNo);
						}

					} else {
						LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
						LocalDateTime extendedEnd = originEnd.isAfter(now) ? originEnd.plusMinutes(5) : end;
						mapper.extendSuspensionEnd(targetMemberNo, extendedEnd);
					}
				}
				return true;
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw e;
		}

		return false;
	}
	
	  public String findMemberId(String name, String email) {
	        return mapper.findMemberId(name, email);
	    }


	@Override
	public boolean resetPassword(String memberId, String email) {
	    Member member = mapper.selectMemberByIdAndEmail(memberId, email);
	    if (member == null) return false;

	    String tempPw = generateTempPassword();
	    String encryptedPw = bcrypt.encode(tempPw); // 기존 bcrypt 인스턴스 사용

	    mapper.updatePassword(member.getMemberNo(), encryptedPw);

	    try {
	        SimpleMailMessage message = new SimpleMailMessage();
	        message.setTo(email);
	        message.setSubject("[UBI] 임시 비밀번호 안내");
	        message.setText("임시 비밀번호: " + tempPw + "\n로그인 후 반드시 비밀번호를 변경해주세요.");
	        message.setFrom("noreply@ubi.com");
	        mailSender.send(message);
	        return true;
	    } catch (Exception e) {
	        log.error("임시 비밀번호 이메일 전송 실패", e);
	        return false;
	    }
	}
	
	private String generateTempPassword() {
	    return UUID.randomUUID().toString().substring(0, 10);
	}
}
