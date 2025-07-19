package edu.kh.project.member.controller;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.email.model.service.EmailService;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.dto.SendCodeRequest;
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.member.model.service.MemberService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/member")
@Slf4j
@CrossOrigin(origins = "*")
public class MemberController {

	@Value("${my.profile.folder-path}")
	private String profileFolderPath;

	@Value("${my.profile.web-path}")
	private String profileWebPath;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private MemberMapper mapper;

	@Autowired
	private EmailService emailService;

	private String parseMemberStandard(String codeStr) {
		switch (codeStr) {
		case "1":
			return "노인";
		case "2":
			return "청년";
		case "3":
			return "아동";
		case "4":
			return "노인+장애인";
		case "5":
			return "청년+장애인";
		case "6":
			return "아동+장애인";
		case "7":
			return "장애인";
		case "A":
			return "임산부";
		case "B":
			return "임산부+장애인";
		case "C":
			return "임산부+청년";
		case "D":
			return "임산부+아동";
		case "E":
			return "임산부+노인";
		case "F":
			return "임산부+노인+장애인";
		default:
			return "일반";
		}
	}

	@Autowired
	private MemberService service;

	/** ✅ 로그인 (Zustand용 JSON 응답) */
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Member input, HttpSession session) {
		Member loginMember = service.login(input.getMemberId(), input.getMemberPw());

		if (loginMember == null) {
			return ResponseEntity.badRequest().body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
		}

		// 1) 회원 정지 정보 조회
		Map<String, String> suspension = mapper.selectSuspension(loginMember.getMemberNo());

		LocalDateTime now = LocalDateTime.now();

		if (suspension != null) {
			LocalDateTime suspendEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
			String suspendStart = suspension.get("START_DATE");
			String suspendEndStr = suspension.get("END_DATE");
			String notified = suspension.get("NOTIFIED");

			if (now.isBefore(suspendEnd)) {
				// 2) 정지 기간 내 로그인 시도 -> 로그인 차단 및 알림
				String period = suspendStart + " ~ " + suspendEndStr;
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("message", "회원님의 계정은 정지 중입니다.\n정지 기간: " + period));
			} else {
				// 3) 정지 기간 종료 후

				if ("N".equals(notified)) {
					// 알림 안 띄운 상태면 알림 띄우고 notified 업데이트
					mapper.updateSuspensionNotified(loginMember.getMemberNo());

					// 🔄 신고 횟수 초기화
					mapper.resetReportCount(loginMember.getMemberNo());
					mapper.updateReportStatusSuspension(loginMember.getMemberNo());

					session.setAttribute("loginMember", loginMember);

					Map<String, Object> body = createLoginResponseBody(loginMember);
					body.put("suspensionNotice", "회원님의 정지 기간이 종료되었습니다.");

					return ResponseEntity.ok(body);
				}
			}
		}

		// 4) 정상 로그인 처리
		session.setAttribute("loginMember", loginMember);
		Map<String, Object> body = createLoginResponseBody(loginMember);

		return ResponseEntity.ok(body);
	}

	// 공통 응답 Body 생성 메서드 (코드 중복 방지용)
	private Map<String, Object> createLoginResponseBody(Member loginMember) {
		String readableStandard = parseMemberStandard(loginMember.getMemberStandard());
		String district = extractDistrict(loginMember.getMemberAddress());
		String token = jwtUtil.generateToken(loginMember);

		Map<String, Object> body = new HashMap<>();
		body.put("token", token);
		body.put("memberName", loginMember.getMemberName());
		body.put("memberNickname", loginMember.getMemberNickname());
		body.put("address", district);
		body.put("memberStandard", readableStandard);
		body.put("memberImg", loginMember.getMemberImg());
		body.put("memberNo", loginMember.getMemberNo());
		body.put("authority", loginMember.getAuthority());
		body.put("regionCity", loginMember.getRegionCity());
		body.put("regionDistrict", loginMember.getRegionDistrict());
		body.put("taddress", loginMember.getMemberTaddress());
		return body;
	}

	private String extractDistrict(String fullAddress) {
		if (fullAddress == null || fullAddress.isBlank())
			return "";
		String[] tokens = fullAddress.trim().split(" ");
		if (tokens.length == 1)
			return tokens[0];
		return tokens[0] + " " + tokens[1];
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@ModelAttribute Member inputMember) {
		// 1. 주소에서 시/도, 시/군/구 추출
		String fullAddress = inputMember.getMemberAddress();
		if (fullAddress != null && !fullAddress.isBlank()) {
			String[] parts = fullAddress.split("\\^\\^\\^"); // "우편번호^^^기본주소^^^상세주소"
			String baseAddress = parts.length >= 2 ? parts[1] : fullAddress;
			String[] tokens = baseAddress.trim().split(" ");

			if (tokens.length >= 2) {
				String sido = normalizeSido(tokens[0]);
				String sigungu = normalizeSigungu(tokens[1]);
				inputMember.setRegionCity(sido);
				inputMember.setRegionDistrict(sigungu);
			}
		}

		// 2. 기본 권한 부여
		inputMember.setAuthority("1"); // 일반 사용자

		// 3. DB에 회원 정보 저장
		int result = service.signup(inputMember); // 이 시점에 memberNo가 자동으로 세팅돼야 함

		if (result > 0) {
			String token = jwtUtil.generateToken(inputMember);
			return ResponseEntity.ok(Map.of("success", true, "message", "회원가입 완료", "token", token, "memberName",
					inputMember.getMemberNickname(), "address", extractDistrict(inputMember.getMemberAddress()),
					"memberStandard", parseMemberStandard(inputMember.getMemberStandard()), "memberNo",
					inputMember.getMemberNo(), "authority", inputMember.getAuthority()));
		} else {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "회원가입 실패"));
		}
	}

	@PostMapping("/sendAuthCode")
	public ResponseEntity<?> sendAuthCode(@RequestParam("email") String email, HttpSession session) {
		String authCode = service.createRandomCode(); // 예: "836524"
		boolean result = service.sendAuthCodeToEmail(email, authCode); // 이메일 전송

		if (result) {
			session.setAttribute("authCode", authCode);
			session.setMaxInactiveInterval(180); // 3분 유효
			return ResponseEntity.ok(Map.of("message", "인증번호가 이메일로 전송되었습니다."));
		} else {
			return ResponseEntity.internalServerError().body(Map.of("message", "이메일 전송 실패"));
		}
	}

	@GetMapping("/checkAuthCode")
	public ResponseEntity<?> checkAuthCode(@RequestParam("inputCode") String inputCode, HttpSession session) {
		String savedCode = (String) session.getAttribute("authCode");
		if (savedCode != null && savedCode.equals(inputCode)) {
			return ResponseEntity.ok(Map.of("message", "인증 성공"));
		} else {
			return ResponseEntity.badRequest().body(Map.of("message", "인증번호가 일치하지 않습니다."));
		}
	}

	@GetMapping("/checkId")
	public ResponseEntity<?> checkId(@RequestParam("memberId") String memberId) {
		System.out.println("✅ checkId() 호출됨: " + memberId);
		boolean isAvailable = service.checkIdAvailable(memberId);
		return isAvailable ? ResponseEntity.ok().build()
				: ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 아이디입니다."));
	}

	@GetMapping("/checkNickname")
	public ResponseEntity<?> checkNickname(@RequestParam("memberNickname") String memberNickname) {
		boolean isAvailable = service.checkNicknameAvailable(memberNickname); // ✅ 오타 수정
		return isAvailable ? ResponseEntity.ok().build()
				: ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 닉네임입니다.")); // 메시지도 닉네임용으로 변경
	}
	
	@GetMapping("/checkEmail")
	public ResponseEntity<?> checkEmail(@RequestParam("email") String email) {
	    boolean isAvailable = service.checkEmailAvailable(email);
	    return isAvailable ? ResponseEntity.ok().build()
	           : ResponseEntity.status(409).body(Map.of("message", "이미 가입된 이메일입니다."));
	}

	@PostMapping("/kakao-login")
	public ResponseEntity<?> kakaoLogin(@RequestParam("code") String code) {
		try {
			Member member = service.kakaoLogin(code); // 반환 타입을 Member로 가정

			// 1) 회원 정지 정보 조회
			Map<String, String> suspension = mapper.selectSuspension(member.getMemberNo());
			LocalDateTime now = LocalDateTime.now();

			if (suspension != null) {
				LocalDateTime suspendEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
				String suspendStart = suspension.get("START_DATE");
				String suspendEndStr = suspension.get("END_DATE");
				String notified = suspension.get("NOTIFIED");

				if (now.isBefore(suspendEnd)) {
					// 2) 정지 기간 내 로그인 시도 → 로그인 차단
					String period = suspendStart + " ~ " + suspendEndStr;
					return ResponseEntity.status(HttpStatus.FORBIDDEN)
							.body(Map.of("message", "회원님의 계정은 정지 중입니다.\n정지 기간: " + period));
				} else {
					// 3) 정지 기간이 끝났고 아직 알림을 안 띄운 경우
					if ("N".equals(notified)) {
						mapper.updateSuspensionNotified(member.getMemberNo());

						// 🚨 신고 횟수 초기화 및 상태 업데이트
						mapper.resetReportCount(member.getMemberNo());
						mapper.updateReportStatusSuspension(member.getMemberNo());

						// 로그인 성공 + 정지 해제 알림 포함
						String readableStandard = parseMemberStandard(member.getMemberStandard());
						String district = extractDistrict(member.getMemberAddress());
						String token = jwtUtil.generateToken(member);

						Map<String, Object> body = new HashMap<>();
						body.put("token", token);
						body.put("memberName", member.getMemberNickname());
						body.put("address", district);
						body.put("memberStandard", readableStandard);
						body.put("memberImg", member.getMemberImg());
						body.put("memberNo", member.getMemberNo());
						body.put("authority", member.getAuthority());
						body.put("regionCity", member.getRegionCity());
						body.put("regionDistrict", member.getRegionDistrict());
						body.put("suspensionNotice", "회원님의 정지 기간이 종료되었습니다.");

						return ResponseEntity.ok(body);
					}
				}
			}

			// 4) 정상 로그인 처리
			String readableStandard = parseMemberStandard(member.getMemberStandard());
			String district = extractDistrict(member.getMemberAddress());
			String token = jwtUtil.generateToken(member);

			Map<String, Object> body = new HashMap<>();
			body.put("token", token);
			body.put("memberName", member.getMemberNickname());
			body.put("address", district);
			body.put("memberStandard", readableStandard);
			body.put("memberImg", member.getMemberImg());
			body.put("memberNo", member.getMemberNo());
			body.put("authority", member.getAuthority());
			body.put("regionCity", member.getRegionCity());
			body.put("regionDistrict", member.getRegionDistrict());

			return ResponseEntity.ok(body);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "카카오 로그인 실패"));
		}
	}

	private String normalizeSido(String rawSido) {
		if (rawSido == null)
			return "";

		rawSido = rawSido.trim().replaceAll("[^가-힣]", ""); // 숫자, 기호 제거

		switch (rawSido) {
		case "서울":
		case "서울시":
			return "서울특별시";
		case "부산":
		case "부산시":
			return "부산광역시";
		case "대구":
		case "대구시":
			return "대구광역시";
		case "인천":
		case "인천시":
			return "인천광역시";
		case "광주":
		case "광주시":
			return "광주광역시";
		case "대전":
		case "대전시":
			return "대전광역시";
		case "울산":
		case "울산시":
			return "울산광역시";
		case "세종":
		case "세종시":
			return "세종특별자치시";

		case "경기":
		case "경기도":
			return "경기도";

		case "강원":
		case "강원도":
			return "강원특별자치도";
		case "전북":
		case "전라북도":
			return "전북특별자치도";
		case "전남":
		case "전라남도":
			return "전라남도";
		case "충북":
		case "충청북도":
			return "충청북도";
		case "충남":
		case "충청남도":
			return "충청남도";
		case "경북":
		case "경상북도":
			return "경상북도";
		case "경남":
		case "경상남도":
			return "경상남도";
		case "제주":
		case "제주도":
		case "제주특별자치도":
			return "제주특별자치도";

		default:
			return rawSido; // 예외는 그대로 반환
		}
	}

	public String normalizeSigungu(String rawSigungu) {
		if (rawSigungu == null)
			return "";
		rawSigungu = rawSigungu.trim().replaceAll("[^가-힣]", "");

		switch (rawSigungu) {
		case "수원":
		case "수원시":
			return "수원특례시";
		case "고양":
		case "고양시":
			return "고양특례시";
		case "용인":
		case "용인시":
			return "용인특례시";
		case "창원":
		case "창원시":
			return "창원특례시";

		default:
			return rawSigungu;
		}
	}

	@GetMapping("/info")
	public ResponseEntity<?> getLoginMember(HttpSession session) {
		Member loginMember = (Member) session.getAttribute("loginMember");

		if (loginMember == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인한 사용자 없음"));
		}

		// 필요한 정보만 추려서 보냄
		String readableStandard = parseMemberStandard(loginMember.getMemberStandard());
		String district = extractDistrict(loginMember.getMemberAddress());

		Map<String, Object> body = new HashMap<>();
		body.put("memberId", loginMember.getMemberId());
		body.put("memberName", loginMember.getMemberNickname());
		body.put("memberAddressCity", district.split(" ")[0]); // 서울특별시
		body.put("memberAddressDistrict", district.split(" ")[1]); // 종로구
		body.put("memberNo", loginMember.getMemberNo());
		body.put("memberStandard", readableStandard);
		body.put("memberImg", loginMember.getMemberImg());
		body.put("authority", loginMember.getAuthority());

		return ResponseEntity.ok(body);
	}

	@GetMapping("/kakao-info")
	public ResponseEntity<?> kakaoSessionCheck(HttpSession session) {
		Member loginMember = (Member) session.getAttribute("loginMember");

		if (loginMember != null) {
			String readableStandard = parseMemberStandard(loginMember.getMemberStandard());
			String district = extractDistrict(loginMember.getMemberAddress());

			return ResponseEntity.ok(Map.of("token", "dummy-token", "memberName", loginMember.getMemberNickname(),
					"authority", loginMember.getAuthority(), "address", district, "memberNo", loginMember.getMemberNo(),
					"memberStandard", readableStandard));
		}

		// 신규 사용자면 kakaoId만 꺼냄
		String kakaoId = (String) session.getAttribute("kakaoId");
		if (kakaoId != null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("kakaoId", kakaoId));
		}

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인 정보 없음"));
	}

	@GetMapping("/me")
	public ResponseEntity<?> getMemberFromToken(@RequestHeader("Authorization") String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "토큰 없음"));
		}

		try {
			String token = authorizationHeader.substring(7);
			Long memberNo = jwtUtil.extractMemberNo(token);
			Member member = service.findByNo(memberNo);

			if (member == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "회원 정보 없음"));
			}

			String readableStandard = parseMemberStandard(member.getMemberStandard());
			String district = extractDistrict(member.getMemberAddress());

			return ResponseEntity.ok(Map.of("memberName", member.getMemberNickname(), "address", district, "memberNo",
					member.getMemberNo(), "memberStandard", readableStandard, "authority", member.getAuthority(),
					// ✅ 여기 추가
					"regionCity", member.getRegionCity(), "regionDistrict", member.getRegionDistrict(), "taddress",
					member.getMemberTaddress()

			));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "유효하지 않은 토큰"));
		}
	}

	// 멤버 신고했는지 여부 가져오는 메소드
	@GetMapping("/{targetMemberNo}/report-status")
	public ResponseEntity<String> getReportStatus(@PathVariable("targetMemberNo") int targetMemberNo,
			@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
		int reporterNo = jwtUtil.extractMemberNo(token).intValue();

		String status = mapper.checkReportStatus(targetMemberNo, reporterNo);
		return ResponseEntity.ok(status); // null, "Y", "N" 중 하나
	}

	// 멤버 신고하는 경우
	@PostMapping("/{targetMemberNo}/report")
	public ResponseEntity<?> reportMember(@PathVariable("targetMemberNo") int targetMemberNo,
			@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader) {
		String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
		int reporterMemberNo = jwtUtil.extractMemberNo(token).intValue(); // 신고한 사람

		String reason = body.get("reason");

		service.reportMember(targetMemberNo, reporterMemberNo, reason);

		return ResponseEntity.ok().build();
	}

	// 멤버 정지 여부 확인
	@GetMapping("/{targetMemberNo}/suspend-status")
	public ResponseEntity<Object> checkSuspendStatus(@PathVariable("targetMemberNo") int targetMemberNo) {
		return ResponseEntity.ok(service.checkSuspension(targetMemberNo));
	}

	// 멤버 정지하는 경우
	@PostMapping("/{targetMemberNo}/suspend")
	public ResponseEntity<?> toggleSuspend(@PathVariable("targetMemberNo") int targetMemberNo) {
		boolean isSuspended = service.suspendMember(targetMemberNo);
		return ResponseEntity.ok(isSuspended ? "정지됨" : "정지 해제됨");
	}

	// 인증번호 보내기
	@PostMapping("/sendCode")
	public ResponseEntity<?> sendCode(@RequestBody SendCodeRequest req) {
		try {
			String email = req.getEmail();
			String type = req.getType();

			// 아이디 찾기 (name + email)
			if ("id".equals(type)) {
				Integer exists = service.existsByNameAndEmail(req.getName(), email);
				if (Objects.isNull(exists) || exists == 0) {
					return ResponseEntity.status(HttpStatus.BAD_REQUEST)
							.body(Map.of("message", "입력하신 정보와 일치하는 사용자가 없습니다."));
				}
			}
			// 비밀번호 찾기 (name + memberId + email)
			else if ("pw".equals(type)) {
				Integer exists = service.existsByNameAndMemberIdAndEmail(req.getName(), req.getMemberId(), email);
				if (Objects.isNull(exists) || exists == 0) {
					return ResponseEntity.status(HttpStatus.BAD_REQUEST)
							.body(Map.of("message", "입력하신 정보와 일치하는 사용자가 없습니다."));
				}
			}

			// 인증 코드 전송
			String code = emailService.sendEmail(type, email);

			if (code != null) {
				return ResponseEntity.ok(Map.of("code", code));
			} else {
				return ResponseEntity.status(500).body(Map.of("message", "이메일 전송 실패"));
			}

		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("message", "서버 오류: " + e.getMessage()));
		}
	}

	// 인증번호 비교 로직
	@PostMapping("/verifyCode")
	public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> paramMap) {
		String email = paramMap.get("email");
		String code = paramMap.get("code");

		int result = emailService.checkAuthKey(Map.of("email", email, "authKey", code));

		boolean verified = result > 0;

		return ResponseEntity.ok(Map.of("verified", verified));
	}

	// 아이디 찾기
	@PostMapping("/find-id")
	public ResponseEntity<?> findId(@RequestBody Map<String, String> paramMap) {
		String name = paramMap.get("name");
		String email = paramMap.get("email");

		String foundId = service.findIdByNameAndEmail(name, email);

		if (foundId == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "일치하는 회원이 없습니다."));
		}

		return ResponseEntity.ok(Map.of("memberId", foundId));
	}

	// 2. 비밀번호 재설정
	@PostMapping("/reset-pw")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> paramMap) {
		String memberId = paramMap.get("memberId");
		String newPassword = paramMap.get("newPassword");

		boolean success = service.resetPassword(memberId, newPassword);

		if (success) {
			return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
		}

		// 실패 시, "비밀번호가 기존과 동일" 또는 "회원 없음" 등의 경우를 포함
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("message", "비밀번호를 변경할 수 없습니다. 입력 정보를 확인해 주세요."));
	}
}
