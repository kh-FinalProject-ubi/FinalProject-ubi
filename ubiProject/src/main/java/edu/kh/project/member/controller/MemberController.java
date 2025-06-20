package edu.kh.project.member.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.service.MemberService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/member")
@Slf4j
public class MemberController {

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
        return ResponseEntity.ok(Map.of(
            "token", "dummy-token",
            "memberName", loginMember.getMemberNickname(),
            "address", loginMember.getMemberAddress()
        ));
    }

    /** ✅ 회원가입 (Zustand 대응용 API) */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
        @RequestBody Member inputMember,
        @RequestParam(value = "memberAddress", required = false) String[] memberAddress
    ) {
        int result = service.signup(inputMember, memberAddress);

        if (result > 0) {
            return ResponseEntity.ok(
                Map.of("message", inputMember.getMemberNickname() + "님의 가입을 환영합니다!")
            );
        } else {
            return ResponseEntity
                .badRequest()
                .body(Map.of("message", "회원 가입 실패"));
        }
    }

    /** ✅ 이메일 중복 체크 */
    @GetMapping("/checkEmail")
    public ResponseEntity<Integer> checkEmail(@RequestParam("memberEmail") String email) {
        return ResponseEntity.ok(service.checkEmail(email));
    }

    /** ✅ 닉네임 중복 체크 */
    @GetMapping("/checkNickname")
    public ResponseEntity<Integer> checkNickname(@RequestParam("memberNickname") String nickname) {
        return ResponseEntity.ok(service.checkNickname(nickname));
    }

    /** ✅ 로그아웃은 프론트에서 상태만 비우면 되므로 서버처리 불필요 */
}
