package edu.kh.project.welfare.detail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.kh.project.API.model.dto.SeoulWelfareAPI;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.web.client.RestTemplate;

@Component("seoul")
@RequiredArgsConstructor
public class SeoulDetailFetcher implements WelfareDetailFetcher {

    @Value("${seoul.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;

    @Override
    public Map<String, Object> fetchDetail(String apiServiceId) {
        try {
            String id = apiServiceId.replace("seoul-", "");

            String url = "http://openapi.seoul.go.kr:8088/" + apiKey + "/json/ListPublicReservationCulture/1/1000";

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode rows = root.path("ListPublicReservationCulture").path("row");

            for (JsonNode node : rows) {
                SeoulWelfareAPI dto = objectMapper.treeToValue(node, SeoulWelfareAPI.class);
                if (dto.getApiServiceId() != null && dto.getApiServiceId().equals(id)) {
                    return Map.of("detail", dto);
                }
            }

            return Map.of("detail", null); // ❌ 못 찾았을 경우

        } catch (Exception e) {
            throw new RuntimeException("❌ 서울시 상세 정보 조회 실패", e);
        }
    }
}