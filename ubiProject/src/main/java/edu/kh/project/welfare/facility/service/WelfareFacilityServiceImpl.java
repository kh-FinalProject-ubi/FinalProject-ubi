package edu.kh.project.welfare.facility.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

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
        var apiInfo = regionMapper.selectApiInfo(city, district);
        log.debug("🧪 조회된 apiInfo: {}", apiInfo);

        if (apiInfo == null) {
            log.warn("❌ API 정보 없음: city={}, district={}", city, district);
            return Collections.emptyList();
        }

        String url = String.format(
            "https://api.odcloud.kr/api/%s/v1/%s?serviceKey=%s&returnType=json&page=1&perPage=100",
            apiInfo.getDatasetId(), apiInfo.getUddiId(), serviceKey);

        log.info("📡 외부 API 호출 URL: {}", url);

        try {
            String response = restTemplate.getForObject(url, String.class);
            log.debug("📦 API 응답 본문: {}", response);

            ObjectMapper mapper = new ObjectMapper();
            WelfareFacilityResponse result = mapper.readValue(response, WelfareFacilityResponse.class);

            List<WelfareFacility> facilities = result.getRow(); // 'data' 필드에 매핑됨

            log.info("✅ getRow() 결과 시설 개수: {}", facilities != null ? facilities.size() : "null");

            if (facilities != null) {
                for (WelfareFacility f : facilities) {
                    log.info("🏠 시설명: {}, 주소: {}", f.get시설명(), f.get주소());
                }
            }

            return facilities;

        } catch (Exception e) {
            log.error("💥 복지시설 API 호출 중 예외 발생", e);
            return Collections.emptyList();
        }
    }
}