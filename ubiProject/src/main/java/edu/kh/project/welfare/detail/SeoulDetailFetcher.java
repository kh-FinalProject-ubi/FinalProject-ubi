package edu.kh.project.welfare.detail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.kh.project.API.model.dto.SeoulWelfareAPI;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.client.RestTemplate;

@Component("seoul")
@RequiredArgsConstructor
public class SeoulDetailFetcher implements WelfareDetailFetcher {

    @Value("${seoul.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate; // ✅ 추가됨


    @Override
    public Map<String, Object> fetchDetail(String apiServiceId) {
        Map<String, Object> response = new HashMap<>();

        try {
            String rawId = apiServiceId.replace("seoul-", "");
            String url = "http://openapi.seoul.go.kr:8088/" + apiKey +
                         "/json/ListPublicReservationCulture/1/1000";

            String responseBody = restTemplate.getForObject(url, String.class);

            // XML 또는 HTML 응답일 경우 실패 처리
            if (responseBody.trim().startsWith("<")) {
                System.out.println("❌ 서울시 상세 정보 요청 실패: XML 형식 응답 감지됨");
                System.out.println("📦 응답 내용:\n" + responseBody);
                response.put("detail", null);
                return response;
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode items = root.path("ListPublicReservationCulture").path("row");

            for (JsonNode item : items) {
                if (item.path("SVCID").asText().equals(rawId)) {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("apiServiceId", apiServiceId);
                    detail.put("serviceName", item.path("SVCNM").asText());
                    detail.put("category", "서울시 복지");
                    detail.put("description", item.path("SVCMNM").asText());
                    detail.put("regionCity", "서울특별시");
                    detail.put("regionDistrict", item.path("PLACENM").asText());
                    detail.put("imageProfile", item.path("IMGURL").asText());
                    detail.put("url", item.path("SVCURL").asText());

                    response.put("detail", detail);
                    return response;
                }
            }

            // 일치하는 항목이 없는 경우
            System.out.println("⚠️ 대상 ID와 일치하는 항목이 없음: " + rawId);
            response.put("detail", null);
            return response;

        } catch (Exception e) {
            System.out.println("❌ 서울 상세 조회 중 예외 발생: " + e.getMessage());
            response.put("detail", null);
            return response;
        }
    }
}