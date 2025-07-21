package edu.kh.project.welfare.like.model.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import edu.kh.project.welfare.like.dto.FacilityLike;
import edu.kh.project.welfare.like.model.mapper.WelfareFacilityLikeMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WelfareFacilityLikeServiceImpl implements WelfareFacilityLikeService {

    private final WelfareFacilityLikeMapper mapper;

    @Override
    public boolean toggleLike(FacilityLike dto, Long memberNo) {

        dto.setMemberNo(memberNo);

        String jjDelFl = mapper.selectLikeStatus(dto);

        if (jjDelFl == null) {
            // 찜 기록이 없음 → insert
            String generatedApiId = "FAC-" + UUID.randomUUID().toString().substring(0, 8);
            dto.setFacilityApiServiceId(generatedApiId);
            mapper.insertLike(dto);
            return true;

        } else if ("Y".equals(jjDelFl)) {
            // 찜 기록은 있으나 해제된 상태 → 복구
            mapper.reactivateLike(dto);
            return true;

        } else {
            // 이미 찜 상태 → 해제 처리
            mapper.deleteLike(dto);
            return false;
        }
    }

    @Override
    public boolean isLiked(String facilityName, String regionCity, String regionDistrict, Long memberNo) {
        FacilityLike dto = new FacilityLike();
        dto.setFacilityName(facilityName);
        dto.setRegionCity(regionCity);
        dto.setRegionDistrict(regionDistrict);
        dto.setMemberNo(memberNo);

        String jjDelFl = mapper.selectLikeStatus(dto);
        return "N".equals(jjDelFl);
    }
}