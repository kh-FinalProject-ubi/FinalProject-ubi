package edu.kh.project.welfare.like.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.like.model.service.WelfareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;


@RestController
@RequestMapping("/api/welfare")
@RequiredArgsConstructor
@Slf4j
public class WelfareLikeController {

    private final WelfareService welfareService;
    

    // ✅ 찜 등록
    @PostMapping("/like")
    public ResponseEntity<String> addLike(@RequestBody Welfare dto,
                                          @AuthenticationPrincipal CustomUser user) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("✅ 인증 객체: " + auth);
        System.out.println("✅ 권한: " + auth.getAuthorities());

        dto.setMemberNo(user.getId());
        welfareService.addLike(dto);
        return ResponseEntity.ok("찜 등록 완료");
    }
    // ✅ 찜 취소
    @DeleteMapping("/like")
    public ResponseEntity<String> cancelLike(@RequestBody Welfare dto,
                                             @AuthenticationPrincipal CustomUser user) {
        dto.setMemberNo(user.getId());
        welfareService.cancelLike(dto);
        return ResponseEntity.ok("찜 취소 완료");
    }
    
    @GetMapping("/popular")
    public List<Welfare> getPopularWelfare() {
        return welfareService.selectPopularWelfare();
    }
}