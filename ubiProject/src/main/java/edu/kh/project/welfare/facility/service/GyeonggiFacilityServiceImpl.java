package edu.kh.project.welfare.facility.service;

import java.net.URL;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;

@Service
public class GyeonggiFacilityServiceImpl implements GyeonggiFacilityService {

    @Value("${gyeonggi.api.key}")
    private String apiKey;

    @Override
    public List<GyeonggiFacility> getGyeonggiFacilities(String city, String district) {
        try {
            String requestUrl = UriComponentsBuilder.fromHttpUrl("https://openapi.gg.go.kr/PublicFacilityOpening")
                    .queryParam("KEY", apiKey)
                    .queryParam("Type", "xml")
                    .queryParam("pIndex", 1)
                    .queryParam("pSize", 1000)
                    .build()
                    .toUriString();

            XmlMapper xmlMapper = new XmlMapper();

            // 루트 요소 파싱
            Map<?, ?> root = xmlMapper.readValue(new URL(requestUrl), Map.class);
            Map<?, ?> response = (Map<?, ?>) root.get("PublicFacilityOpening");
            List<Map<String, Object>> rowList = (List<Map<String, Object>>) response.get("row");

            // DTO 매핑
            return rowList.stream().map(data -> xmlMapper.convertValue(data, GyeonggiFacility.class)).toList();

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}