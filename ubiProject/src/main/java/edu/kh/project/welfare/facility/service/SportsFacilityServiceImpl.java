package edu.kh.project.welfare.facility.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.SportsFacility;

@Service
public class SportsFacilityServiceImpl implements SportsFacilityService {

    private final RestTemplate restTemplate;

    @Value("${api.seoul.sport.key}") // 🔑 application.properties에서 인증키 주입
    private String apiKey;

    public SportsFacilityServiceImpl(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    @Override
    public List<SportsFacility> getFacilitiesByRegion(String district) {
        try {
            String url = String.format(
                "http://openapi.seoul.go.kr:8088/%s/xml/ListPublicReservationSport/1/1000/",
                apiKey
            );

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String xml = response.getBody();

            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(xml);

            // 🔍 응답 코드 체크
            JsonNode resultNode = root.path("RESULT");
            if (!resultNode.isMissingNode()) {
                String code = resultNode.path("CODE").asText();
                if (!"INFO-000".equals(code)) {
                    String msg = resultNode.path("MESSAGE").asText();
                    throw new RuntimeException("서울시 체육시설 API 오류: " + msg);
                }
            }

            JsonNode rows = root.path("row");
            if (rows == null || !rows.isArray()) return Collections.emptyList();

            List<SportsFacility> result = new ArrayList<>();
            for (JsonNode node : rows) {
                String areaName = node.path("AREANM").asText("").trim();

                // 🧭 지역명 비교 (대소문자 무시, 공백 제거)
                if (!areaName.equalsIgnoreCase(district.trim())) continue;

                SportsFacility dto = new SportsFacility();
                dto.setFacilityName(node.path("SVCNM").asText("").trim());
                dto.setFacilityAddr(node.path("PLACENM").asText("").trim()); // ex: 응봉공원
                dto.setCategory(node.path("MINCLASSNM").asText("").trim());
                dto.setLat(node.path("Y").asDouble());
                dto.setLng(node.path("X").asDouble());
                dto.setImageUrl(node.path("IMGURL").asText("").trim());
                dto.setReservationUrl(node.path("SVCURL").asText("").trim());
                dto.setDescription(node.path("DTLCONT").asText("").trim());
                dto.setType("체육");
                dto.setSvcId(node.path("SVCID").asText("").trim());
                
                result.add(dto);
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("체육시설 조회 중 오류 발생", e);
        }
    }
}