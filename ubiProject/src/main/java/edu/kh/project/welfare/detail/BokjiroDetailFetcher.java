package edu.kh.project.welfare.detail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@Component("bokjiro")
@RequiredArgsConstructor
public class BokjiroDetailFetcher implements WelfareDetailFetcher {

    @Value("${bokjiro.service-key}")
    private String serviceKey;


    @Override
    public Map<String, Object> fetchDetail(String apiServiceId) {
        try {
            String pureServId = apiServiceId.replace("bokjiro-", "");

            String urlStr = UriComponentsBuilder
                    .fromHttpUrl("https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfaredetailed")
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("servId", pureServId)
                    .build(false)
                    .toUriString();

            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/xml");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder responseStrBuilder = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                responseStrBuilder.append(line);
            }
            in.close();

            String xml = responseStrBuilder.toString();

            // 👉 여기서 XmlMapper 직접 생성
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(xml);

            JsonNode detailNode = root.path("wantedDtl");
            if (detailNode.isMissingNode()) {
                return Map.of("detail", root);  // 혹시 전체 반환이 필요한 경우
            }

            return Map.of("detail", detailNode);

        } catch (Exception e) {
            throw new RuntimeException("❌ Bokjiro 상세 정보 조회 실패", e);
        }
    }
}