package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;

public interface GyeonggiFacilityService {
	/**
     * 경기도 지역 복지시설 조회
     * 
     * @param city      - 시/도 (ex: 경기도)
     * @param district  - 시/군/구 (ex: 가평군)
     * @param apiType   - API 유형 (old, child, public)
     * @return          - 해당 지역에 해당하는 복지시설 리스트
     */

    // ✅ 3개 API를 모두 조회하여 병합한 결과 반환
    List<GyeonggiFacility> getFacilitiesByRegion(String city, String district);
}