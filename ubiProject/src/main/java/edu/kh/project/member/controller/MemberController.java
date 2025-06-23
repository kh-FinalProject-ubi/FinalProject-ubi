package edu.kh.project.member.controller;

import java.io.File;
import java.io.IOException;
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
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/member")
@Slf4j
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
    public ResponseEntity<?> login(@RequestBody Member input) {
        Member loginMember = service.login(input.getMemberId(), input.getMemberPw());
        
        if (loginMember == null) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
        }

        // 파싱 시작
        String readableStandard = parseMemberStandard(loginMember.getMemberStandard());

        return ResponseEntity.ok(Map.of(
            "token", "dummy-token",
            "memberName", loginMember.getMemberNickname(),
            "address", loginMember.getMemberAddress(),
            "memberStandard", readableStandard
        ));
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
    @GetMapping("/checkId")
    public ResponseEntity<Integer> checkId(@RequestParam("memberId") String memberId) {
        int result = service.checkId(memberId); // 존재하면 1, 없으면 0
        return ResponseEntity.ok(result);
    }
}
