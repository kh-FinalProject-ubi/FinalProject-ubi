package edu.kh.project.member.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.dto.Member;
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
		default:
			return "일반";
		}
	}


    @Autowired
    private MemberService service;

    /** ✅ 로그인 (Zustand용 JSON 응답) */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Member input,  HttpSession session) {
        Member loginMember = service.login(input.getMemberId(), input.getMemberPw());

        if (loginMember == null) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }


        // 세션에 로그인 정보 저장 (동네게시판 구현)
        session.setAttribute("loginMember", loginMember);
        
        // 파싱 시작
        String readableStandard = parseMemberStandard(loginMember.getMemberStandard());
        String district = extractDistrict(loginMember.getMemberAddress());

        String token = jwtUtil.generateToken(loginMember);
        
        Map<String, Object> body = new HashMap<>();
        body.put("token", token);
        body.put("memberName", loginMember.getMemberNickname());
        body.put("address", district);
        body.put("memberStandard", readableStandard);
        body.put("memberImg", loginMember.getMemberImg());
        body.put("memberNo", loginMember.getMemberNo());
        body.put("authority", loginMember.getAuthority()); // ✅ 반드시 포함

        return ResponseEntity.ok(body);
    }

    private String extractDistrict(String fullAddress) {
        if (fullAddress == null || fullAddress.isBlank()) return "";
        String[] tokens = fullAddress.trim().split(" ");
        if (tokens.length == 1) return tokens[0];
        return tokens[0] + " " + tokens[1];
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
        @ModelAttribute Member inputMember,
        @RequestParam(value = "memberImg", required = false) MultipartFile memberImg
    ) {
        String webPath = profileWebPath;
        String folderPath = profileFolderPath;
        
        String fullAddress = inputMember.getMemberAddress();
        if (fullAddress != null && !fullAddress.isBlank()) {
            String[] parts = fullAddress.split("^^^");
            String baseAddress = parts.length >= 2 ? parts[1] : fullAddress;
            String[] tokens = baseAddress.trim().split(" ");

            if (tokens.length >= 2) {
                String sido = normalizeSido(tokens[0]);
                String sigungu = normalizeSigungu(tokens[1]);
                inputMember.setRegionCity(sido);
                inputMember.setRegionDistrict(sigungu);
            }
        }

        if (memberImg != null && !memberImg.isEmpty()) {
            String renamed = UUID.randomUUID().toString() + "_" + memberImg.getOriginalFilename();
            File dest = new File(folderPath + renamed);
            try {
                memberImg.transferTo(dest);
                inputMember.setMemberImg(webPath + renamed);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("message", "파일 저장 실패"));
            }
        }

        int result = service.signup(inputMember);
        return result > 0
            ? ResponseEntity.ok(Map.of("message", inputMember.getMemberNickname() + "님의 가입을 환영합니다!"))
            : ResponseEntity.badRequest().body(Map.of("message", "회원가입 실패"));
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
    boolean isAvailable = service.checkIdAvailable(memberId); // 중복 없으면 true
    return isAvailable
        ? ResponseEntity.ok().build()
        : ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 아이디입니다."));
}

@GetMapping("/checkNickname")
public ResponseEntity<?> checkNickname(@RequestParam("memberNickname") String memberNickname) {
    boolean isAvailable = service.checkNicknameAvailable(memberNickname); // ✅ 오타 수정
    return isAvailable
        ? ResponseEntity.ok().build()
        : ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 닉네임입니다.")); // 메시지도 닉네임용으로 변경
}
@PostMapping("/kakao-login")
public ResponseEntity<?> kakaoLogin(@RequestParam("code") String code) {
    try {
        Member member = service.kakaoLogin(code); // 반환 타입을 Member로 가정

        String readableStandard = parseMemberStandard(member.getMemberStandard());
        String district = extractDistrict(member.getMemberAddress());

        Map<String, Object> body = new HashMap<>();
        body.put("token", "dummy-token");
        body.put("memberName", member.getMemberNickname());
        body.put("address", district);
        body.put("memberStandard", readableStandard);
        body.put("memberImg", member.getMemberImg());

        return ResponseEntity.ok(body);

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "카카오 로그인 실패"));
    }
}
private String normalizeSido(String rawSido) {
    if (rawSido == null) return "";

    rawSido = rawSido.trim().replaceAll("[^가-힣]", ""); // 숫자, 기호 제거

    switch (rawSido) {
        case "서울": case "서울시": return "서울특별시";
        case "부산": case "부산시": return "부산광역시";
        case "대구": case "대구시": return "대구광역시";
        case "인천": case "인천시": return "인천광역시";
        case "광주": case "광주시": return "광주광역시";
        case "대전": case "대전시": return "대전광역시";
        case "울산": case "울산시": return "울산광역시";
        case "세종": case "세종시": return "세종특별자치시";

        case "경기": case "경기도": return "경기도";

        case "강원": case "강원도": return "강원특별자치도";
        case "전북": case "전라북도": return "전북특별자치도";
        case "전남": case "전라남도": return "전라남도";
        case "충북": case "충청북도": return "충청북도";
        case "충남": case "충청남도": return "충청남도";
        case "경북": case "경상북도": return "경상북도";
        case "경남": case "경상남도": return "경상남도";
        case "제주": case "제주도": case "제주특별자치도": return "제주특별자치도";

        default: return rawSido; // 예외는 그대로 반환
    }
}

public String normalizeSigungu(String rawSigungu) {
    if (rawSigungu == null) return "";
    rawSigungu = rawSigungu.trim().replaceAll("[^가-힣]", "");

    switch (rawSigungu) {
        case "수원": case "수원시": return "수원특례시";
        case "고양": case "고양시": return "고양특례시";
        case "용인": case "용인시": return "용인특례시";
        case "창원": case "창원시": return "창원특례시";

        default: return rawSigungu;
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
		body.put("memberStandard", readableStandard);
		body.put("memberImg", loginMember.getMemberImg());

		return ResponseEntity.ok(body);
	}


}