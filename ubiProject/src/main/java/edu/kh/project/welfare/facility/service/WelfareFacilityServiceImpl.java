package edu.kh.project.welfare.facility.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import edu.kh.project.welfare.facility.dto.WelfareFacility;
import edu.kh.project.welfare.facility.dto.WelfareFacilityResponse;
import edu.kh.project.welfare.facility.mapper.RegionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WelfareFacilityServiceImpl implements WelfareFacilityService {

	private final RegionMapper regionMapper;
	private final RestTemplate restTemplate;

	@Value("${public.api.service-key}")
	private String serviceKey;

	@Override
	public List<WelfareFacility> getFacilitiesByRegion(String city, String district) {

		// 1. 시도, 시군구 기반으로 REGION 테이블에서 API 정보 조회
		var apiInfo = regionMapper.selectApiInfo(city, district);

		if (apiInfo == null) {
			log.warn("❌ API 정보가 존재하지 않습니다: city={}, district={}", city, district);
			return Collections.emptyList();
		}

		// 2. URL 조립
		String url = String.format(
				"https://api.odcloud.kr/api/%s/v1/%s?serviceKey=%s&returnType=XML&page=1&perPage=100",
				apiInfo.getApiDatasetId(), apiInfo.getApiEndpointId(), serviceKey);

		log.info("📡 외부 API 호출 URL: {}", url);

		try {
			// 3. API 호출 및 파싱
			WelfareFacilityResponse response = restTemplate.getForObject(url, WelfareFacilityResponse.class);

			if (response == null) {
				log.warn("⚠️ API 응답이 null입니다.");
				return Collections.emptyList();
			}

			return response.getRow();
		} catch (Exception e) {
			log.error("💥 복지시설 API 호출 중 예외 발생", e);
			return Collections.emptyList();
		}
	}
}
