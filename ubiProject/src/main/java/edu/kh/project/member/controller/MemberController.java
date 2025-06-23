package edu.kh.project.member.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
	
	private String parseMemberStandard(String codeStr) {
	    switch (codeStr) {
	        case "1": return "노인";
	        case "2": return "청년";
	        case "3": return "아동";
	        case "4": return "노인+장애인";
	        case "5": return "청년+장애인";
	        case "6": return "아동+장애인";
	        case "7": return "장애인";
	        default: return "일반";
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

        Map<String, Object> body = new HashMap<>();
        body.put("token", "dummy-token");
        body.put("memberName", loginMember.getMemberNickname());
        body.put("address", district); // ✅ 시군구 단위로 가공
        body.put("memberStandard", readableStandard);
        body.put("memberImg", loginMember.getMemberImg());

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
}