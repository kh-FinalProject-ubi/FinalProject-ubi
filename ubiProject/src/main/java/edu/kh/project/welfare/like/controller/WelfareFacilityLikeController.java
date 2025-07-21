package edu.kh.project.welfare.like.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.BusanFacility;
import edu.kh.project.welfare.facility.dto.JejuFacility;
import edu.kh.project.welfare.facility.dto.WelfareFacility;
import edu.kh.project.welfare.like.dto.FacilityLike;
import edu.kh.project.welfare.like.dto.FacilityLikeConverter;
import edu.kh.project.welfare.like.model.service.WelfareFacilityLikeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/welfarefacility/like")
@RequiredArgsConstructor
public class WelfareFacilityLikeController {

    private final WelfareFacilityLikeService likeService;

    // ✅ 1. 찜 등록/취소 토글
    /** ✅ 1. 부산 찜 토글 */
    @PostMapping("/busan")
    public ResponseEntity<?> toggleLikeBusan(@RequestBody BusanFacility dto,
                                             @AuthenticationPrincipal CustomUser user) {
        FacilityLike like = FacilityLikeConverter.fromBusanFacility(dto, (long) user.getMemberNo());
        boolean result = likeService.toggleLike(like, like.getMemberNo());
        return ResponseEntity.ok(result);
    }

    /** ✅ 2. 서울/복지시설 찜 토글 */
    @PostMapping("/seoul")
    public ResponseEntity<?> toggleLikeWelfare(@RequestBody WelfareFacility dto,
                                               @AuthenticationPrincipal CustomUser user) {
        FacilityLike like = FacilityLikeConverter.fromWelfareFacility(dto, (long) user.getMemberNo());
        boolean result = likeService.toggleLike(like, like.getMemberNo());
        return ResponseEntity.ok(result);
    }

    /** ✅ 3. 제주 찜 토글 */
    @PostMapping("/jeju")
    public ResponseEntity<?> toggleLikeJeju(@RequestBody JejuFacility dto,
                                            @AuthenticationPrincipal CustomUser user) {
        FacilityLike like = FacilityLikeConverter.fromJejuFacility(dto, (long) user.getMemberNo());
        boolean result = likeService.toggleLike(like, like.getMemberNo());
        return ResponseEntity.ok(result);
    }

    /** ✅ 4. 찜 여부 확인 (공통) */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkLike(@RequestParam String facilityName,
                                             @RequestParam String regionCity,
                                             @RequestParam String regionDistrict,
                                             @AuthenticationPrincipal CustomUser user) {
        Long memberNo = (long) user.getMemberNo();
        boolean liked = likeService.isLiked(facilityName, regionCity, regionDistrict, memberNo);
        return ResponseEntity.ok(liked);
    }
}
