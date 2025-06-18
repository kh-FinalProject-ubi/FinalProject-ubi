package edu.kh.project.main.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.core.type.TypeReference;


import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/welfare-curl")
public class WelfareProxyController {

    @Value("${welfare.api.service-key}")
    private String serviceKey;

    private final XmlMapper xmlMapper = new XmlMapper();
    
    @GetMapping("/welfare-list/all")
    public Map<String, Object> getAllWelfareData() {
        List<Map<String, Object>> allItems = new ArrayList<>();
        int pageNo = 1;
        int totalPage = 1;
        int numOfRows = 100;

        XmlMapper xmlMapper = new XmlMapper();

        try {
            while (pageNo <= totalPage) {
                String urlStr = UriComponentsBuilder
                    .fromHttpUrl("https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist")
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("pageNo", pageNo)
                    .queryParam("numOfRows", numOfRows)
                    .build(false)
                    .toUriString();

                HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/xml");

                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
                StringBuilder responseStrBuilder = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) responseStrBuilder.append(line);
                in.close();

                String responseStr = responseStrBuilder.toString();
                JsonNode root = xmlMapper.readTree(responseStr);

                // 페이지 수 계산
                if (pageNo == 1) {
                    int totalCount = root.path("totalCount").asInt();
                    totalPage = (int) Math.ceil((double) totalCount / numOfRows);
                    System.out.println("전체 개수: " + totalCount + " / 총 페이지: " + totalPage);
                }

                // servList 파싱 (단일 or 복수 대응)
                JsonNode servListNode = root.path("servList");
                if (servListNode.isArray()) {
                    for (JsonNode node : servListNode) {
                        Map<String, Object> item = xmlMapper.convertValue(node, new TypeReference<>() {});
                        allItems.add(item);
                    }
                } else if (!servListNode.isMissingNode()) {
                    Map<String, Object> item = xmlMapper.convertValue(servListNode, new TypeReference<>() {});
                    allItems.add(item);
                }

                pageNo++;
                Thread.sleep(100);
            }

            return Map.of("servList", allItems);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("전체 복지 데이터 호출 실패", e);
        }
    }

    
    @GetMapping("/reverse-geocode")
    public ResponseEntity<String> reverseGeocode(@RequestParam("lon") double lon, @RequestParam("lat") double lat) throws Exception {
        String apiKey = "6D96057A-FC81-30BE-B98E-39266237CBD1";
        String url = "https://api.vworld.kr/req/address?service=address&request=getAddress" +
                     "&version=2.0&format=json&type=PARCEL" +
                     "&point=" + lon + "," + lat +
                     "&crs=epsg:4326&key=" + apiKey;

        URL requestUrl = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) requestUrl.openConnection();
        conn.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) {
            response.append(line);
        }
        in.close();

        return ResponseEntity.ok(response.toString());
    }
    @GetMapping("/youth-policy")
    public ResponseEntity<String> proxyYouthPolicy(
            @RequestParam(name = "pageNum", defaultValue = "1") String pageNum,
            @RequestParam(name = "pageSize", defaultValue = "10") String pageSize
    ) throws Exception {

        String youthApiKey = "5594f7e8-d124-49eb-9ace-9338b5e5e4cb";
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.youthcenter.go.kr/go/ythip/getPlcy")
                .queryParam("apiKeyNm", youthApiKey)
                .queryParam("pageNum", pageNum)
                .queryParam("pageSize", pageSize)
                .queryParam("rtnType", "json")
                .build(false)
                .toUriString();

        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");
        conn.setRequestProperty("Accept", "*/*");

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) {
            response.append(line);
        }
        in.close();

        return ResponseEntity.ok(response.toString());
        
    }
    
    @GetMapping("/welfare-detail")
    public Map<String, Object> getWelfareDetail(@RequestParam("servId") String servId) {
        try {
            String urlStr = UriComponentsBuilder
                .fromHttpUrl("https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfaredetailed")
                .queryParam("serviceKey", serviceKey)
                .queryParam("servId", servId)
                .build(false)
                .toUriString();

            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/xml");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder responseStrBuilder = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) responseStrBuilder.append(line);
            in.close();

            JsonNode root = xmlMapper.readTree(responseStrBuilder.toString());

            return Map.of("detail", root);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("복지 상세정보 조회 실패", e);
        }
    }
}