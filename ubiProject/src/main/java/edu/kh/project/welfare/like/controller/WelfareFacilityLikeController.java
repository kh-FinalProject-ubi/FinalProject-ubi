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
import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.member.model.dto.CustomUser;
import edu.kh.project.welfare.facility.dto.BusanFacility;
import edu.kh.project.welfare.facility.dto.GangwonFacility;
import edu.kh.project.welfare.facility.dto.GwangjuFacility;
import edu.kh.project.welfare.facility.dto.GyeonggiFacility;
import edu.kh.project.welfare.facility.dto.IncheonFacility;
import edu.kh.project.welfare.facility.dto.JejuFacility;
import edu.kh.project.welfare.like.dto.FacilityLike;
import edu.kh.project.welfare.like.dto.FacilityLikeConverter;
import edu.kh.project.welfare.like.model.service.WelfareFacilityLikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/welfarefacility/like")
@RequiredArgsConstructor
@Slf4j
public class WelfareFacilityLikeController {

    private final WelfareFacilityLikeService likeService;

    /** ✅ 1. 서울/복지시설 찜 토글 */
    @PostMapping("/seoul")
    public ResponseEntity<?> toggleLikeSeoul(@RequestBody FacilityLike dto,
                                             @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "서울");
    }

    /** ✅ 2. 부산 */
    @PostMapping("/busan")
    public ResponseEntity<?> toggleLikeBusan(@RequestBody FacilityLike dto,
                                             @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "부산");
    }

    /** ✅ 3. 인천 */
    @PostMapping("/incheon")
    public ResponseEntity<?> toggleLikeIncheon(@RequestBody FacilityLike dto,
                                               @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "인천");
    }

    /** ✅ 4. 경기 */
    @PostMapping("/gyeonggi")
    public ResponseEntity<?> toggleLikeGyeonggi(@RequestBody FacilityLike dto,
                                                @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "경기");
    }

    /** ✅ 5. 강원 */
    @PostMapping("/gangwon")
    public ResponseEntity<?> toggleLikeGangwon(@RequestBody FacilityLike dto,
                                               @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "강원");
    }

    /** ✅ 6. 광주 */
    @PostMapping("/gwangju")
    public ResponseEntity<?> toggleLikeGwangju(@RequestBody FacilityLike dto,
                                               @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "광주");
    }

    /** ✅ 7. 제주 */
    @PostMapping("/jeju")
    public ResponseEntity<?> toggleLikeJeju(@RequestBody FacilityLike dto,
                                            @AuthenticationPrincipal CustomUser user) {
        return handleLike(dto, user, "제주");
    }

    /** ✅ 공통 찜 처리 (서울 방식 로그 포함) */
    private ResponseEntity<?> handleLike(FacilityLike dto, CustomUser user, String regionTag) {
        dto.setMemberNo((long) user.getMemberNo());

        log.debug("📍 [{}] facilityName = {}", regionTag, dto.getFacilityName());
        log.debug("📍 [{}] regionCity = {}", regionTag, dto.getRegionCity());
        log.debug("📍 [{}] regionDistrict = {}", regionTag, dto.getRegionDistrict());
        log.debug("📍 [{}] address = {}", regionTag, dto.getFacilityAddr());
        log.debug("📍 [{}] lat = {}, lng = {}", regionTag, dto.getLat(), dto.getLng());

        boolean result = likeService.toggleLike(dto, dto.getMemberNo());
        return ResponseEntity.ok(result);
    }

    /** ✅ 찜 여부 확인 */
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