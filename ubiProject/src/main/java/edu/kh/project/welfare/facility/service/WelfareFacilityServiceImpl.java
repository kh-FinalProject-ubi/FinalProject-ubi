package edu.kh.project.welfare.facility.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
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

        // ✅ API_URL이 존재하면 우선 사용
        String url;
        if (apiInfo.getApiUrl() != null && !apiInfo.getApiUrl().isBlank()) {
            // 인증키 삽입을 위한 format 처리
            url = String.format(apiInfo.getApiUrl(), serviceKey);
        } else {
            url = String.format(
                "https://api.odcloud.kr/api/%s/v1/%s?serviceKey=%s&returnType=json&page=1&perPage=100",
                apiInfo.getDatasetId(), apiInfo.getUddiId(), serviceKey
            );
        }

        log.info("📡 외부 API 호출 URL: {}", url);

        try {
            String response = restTemplate.getForObject(url, String.class);
            log.debug("📦 API 응답 본문: {}", response);

            ObjectMapper mapper = new ObjectMapper();
            List<WelfareFacility> facilities = null;

            // 1차 시도: 기존 DTO 구조 매핑
            try {
                WelfareFacilityResponse result = mapper.readValue(response, WelfareFacilityResponse.class);
                facilities = result.getRow();
                log.info("✅ 1차 파싱 성공 (getRow): {}", facilities != null ? facilities.size() : "null");
            } catch (Exception e) {
                log.warn("⚠️ 1차 DTO 파싱 실패, fallback 진행");
            }

            // 2차 시도: response.body.items 방식
            if (facilities == null || facilities.isEmpty()) {
                try {
                    JsonNode root = mapper.readTree(response);
                    log.debug("🌳 응답 구조 확인: {}", root.toPrettyString());
                    JsonNode items = root.path("response").path("body").path("items").path("item");

                    if (items.isArray()) {
                        facilities = mapper.readerForListOf(WelfareFacility.class).readValue(items);
                        log.info("✅ 2차 파싱 성공 (response.body.items): {}", facilities.size());
                    }
                } catch (Exception e) {
                    log.warn("⚠️ 2차 fallback 파싱 실패", e);
                }
            }

            // 3차 시도: 응답 자체가 배열일 경우
            if (facilities == null || facilities.isEmpty()) {
                try {
                    JsonNode root = mapper.readTree(response);
                    if (root.isArray()) {
                        facilities = mapper.readerForListOf(WelfareFacility.class).readValue(root);
                        log.info("✅ 3차 파싱 성공 (root 배열): {}", facilities.size());
                    }
                } catch (Exception e) {
                    log.warn("⚠️ 3차 fallback 파싱 실패", e);
                }
            }

            if (facilities != null) {
                for (WelfareFacility f : facilities) {
                    log.info("🏠 시설명: {}, 주소: {}", f.get시설명(), f.get주소());
                }
                return facilities;
            } else {
                log.warn("📭 파싱 성공했지만 시설 목록이 비어 있음");
                return Collections.emptyList();
            }

        } catch (Exception e) {
            log.error("💥 복지시설 API 호출 중 예외 발생", e);
            return Collections.emptyList();
        }
    }
}