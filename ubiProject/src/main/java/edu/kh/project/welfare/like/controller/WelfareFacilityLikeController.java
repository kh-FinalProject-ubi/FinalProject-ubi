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
    public ResponseEntity<?> toggleLike(@RequestBody WelfareFacility apiDto,
                                        @AuthenticationPrincipal CustomUser user) {

        Long memberNo = (long) user.getMemberNo();

        // ✅ 변환: API 응답 DTO → DB Insert용 DTO
        FacilityLike like = new FacilityLike();
        like.setMemberNo(memberNo);
        like.setFacilityName(apiDto.get시설명());
        like.setRegionCity(apiDto.get시군구명());
        like.setRegionDistrict(apiDto.get자치구구분());
        like.setCategory(apiDto.get시설종류명());
        like.setDescription("정보 없음");
        like.setAgency("정보 없음");
        like.setFacilityAddr(apiDto.get주소());
        like.setLat(apiDto.getLat());
        like.setLng(apiDto.getLng());
        like.setFacilityApiServiceId("FAC-" + UUID.randomUUID().toString().substring(0, 8));

        boolean isLiked = likeService.toggleLike(like, memberNo);
        return ResponseEntity.ok(isLiked);
    }

    // ✅ 2. 찜 여부 확인
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
