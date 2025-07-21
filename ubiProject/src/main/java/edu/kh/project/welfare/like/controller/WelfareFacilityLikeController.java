package edu.kh.project.welfare.like.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.welfare.like.dto.FacilityLike;
import edu.kh.project.welfare.like.model.service.WelfareFacilityLikeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/welfarefacility/like")
@RequiredArgsConstructor
public class WelfareFacilityLikeController {

    private final WelfareFacilityLikeService likeService;

    // ✅ 1. 찜 등록/취소 토글
    @PostMapping
    public ResponseEntity<?> toggleLike(@RequestBody FacilityLike dto,
                                        @AuthenticationPrincipal CustomUser user) {

        Long memberNo = (long) user.getMemberNo(); // ← int → long 변환
        boolean isLiked = likeService.toggleLike(dto, memberNo);
        return ResponseEntity.ok(isLiked);
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkLike(@RequestParam String facilityName,
                                             @RequestParam String regionCity,
                                             @RequestParam String regionDistrict,
                                             @AuthenticationPrincipal CustomUser user) {

        Long memberNo = (long) user.getMemberNo(); // ← int → long 변환
        boolean liked = likeService.isLiked(facilityName, regionCity, regionDistrict, memberNo);
        return ResponseEntity.ok(liked);
    }
}
