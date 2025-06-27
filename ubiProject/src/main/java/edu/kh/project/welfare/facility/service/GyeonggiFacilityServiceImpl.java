package edu.kh.project.welfare.facility.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;
import edu.kh.project.welfare.facility.dto.RegionApiInfo;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GyeonggiFacilityServiceImpl implements GyeonggiFacilityService {

    @Value("${gyeonggi.api.key}")
    private String serviceKey;

    private String getApiUrl(String apiType) {
        return switch (apiType) {
            case "old" -> "https://openapi.gg.go.kr/HtygdWelfaclt?KEY=%s";
            case "child" -> "https://openapi.gg.go.kr/Childwelfarefaclt?KEY=%s";
            case "public" -> "https://openapi.gg.go.kr/PublicFacilityOpening?KEY=%s";
            default -> throw new IllegalArgumentException("지원하지 않는 API 유형: " + apiType);
        };
    }

    @Override
    public List<GyeonggiFacility> getFacilitiesByRegion(String city, String district, String apiType) {
        // 1. city 정제
        String cleanCity = city.contains("^^^") ? city.split("\\^\\^\\^")[1] : city;
        if ("경기".equals(cleanCity)) cleanCity = "경기도";
        log.debug("🧪 정제된 city 값: {}, 원본 city: {}", cleanCity, city);

        // ✅ 2. API 호출 URL 생성
        String url = String.format(getApiUrl(apiType), serviceKey);
        log.info("📱 API 호출 URL: {}", url);

        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
            String xml = restTemplate.getForObject(url, String.class);

            // 3. XML 파싱
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(xml);
            JsonNode rowNode = root.get("row");

            if (rowNode == null || !rowNode.isArray()) {
                log.warn("❗ row 항목이 존재하지 않거나 배열 아님");
                return Collections.emptyList();
            }

            List<GyeonggiFacility> allFacilities = new ArrayList<>();
            for (JsonNode node : rowNode) {
                GyeonggiFacility facility = xmlMapper.treeToValue(node, GyeonggiFacility.class);
                allFacilities.add(facility);
            }

            // 4. 필터링 (포함 여부 기반 비교로 개선)
            List<GyeonggiFacility> filtered = new ArrayList<>();
            for (GyeonggiFacility facility : allFacilities) {
                String rawAddress = facility.getAddress();
                if (rawAddress == null || rawAddress.isBlank()) continue;

                // address에서 "^^^" 제거 후 앞쪽 주소만 사용
                String cleanAddress = rawAddress.contains("^^^") ? rawAddress.split("\\^\\^\\^")[1] : rawAddress;
                String fullAddressPrefix = cleanAddress.trim().split(" ")[0] + " " + cleanAddress.trim().split(" ")[1];

                // ex) "경기도 용인시 처인구"가 포함되어 있는지 판단
                if (cleanAddress.contains(cleanCity) && cleanAddress.contains(district)) {
                    facility.setRegionCity(cleanCity);
                    facility.setRegionDistrict(district);
                    filtered.add(facility);
                }
            }

            log.info("✅ 필터링된 시설 수: {}", filtered.size());
            return filtered;

        } catch (Exception e) {
            log.error("💥 API 호출 또는 파싱 실패", e);
            return Collections.emptyList();
        }
    }
}