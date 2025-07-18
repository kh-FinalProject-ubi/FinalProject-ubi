package edu.kh.project.main.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.core.type.TypeReference;


import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/welfare-curl")
@Slf4j
public class WelfareProxyController {

    @Value("${welfare.api.service-key}")
    private String serviceKey;

    private final XmlMapper xmlMapper = new XmlMapper();
    
    @GetMapping("/welfare-list/all")
    public Map<String, Object> getAllWelfareDataParallel() {
        long start = System.currentTimeMillis(); // ⏱ 시작 시간

        List<Map<String, Object>> allItems = Collections.synchronizedList(new ArrayList<>());
        int numOfRows = 100;

        try {
            // 1. 먼저 1페이지 호출해서 전체 페이지 수 알아냄
            String firstUrl = UriComponentsBuilder
                    .fromHttpUrl("https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist")
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("pageNo", 1)
                    .queryParam("numOfRows", numOfRows)
                    .build(false)
                    .toUriString();

            String firstResponse = fetchXml(firstUrl);
            JsonNode root = xmlMapper.readTree(firstResponse);
            int totalCount = root.path("totalCount").asInt();
            int totalPage = (int) Math.ceil((double) totalCount / numOfRows);

            // 2. 병렬로 요청
            ExecutorService executor = Executors.newFixedThreadPool(10); // 병렬 개수 조절 가능
            List<CompletableFuture<Void>> futures = new ArrayList<>();

            for (int page = 1; page <= totalPage; page++) {
                int finalPage = page;
                futures.add(CompletableFuture.runAsync(() -> {
                    try {
                        String pageUrl = UriComponentsBuilder
                                .fromHttpUrl("https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist")
                                .queryParam("serviceKey", serviceKey)
                                .queryParam("pageNo", finalPage)
                                .queryParam("numOfRows", numOfRows)
                                .build(false)
                                .toUriString();

                        String xml = fetchXml(pageUrl);
                        JsonNode pageRoot = xmlMapper.readTree(xml);
                        JsonNode list = pageRoot.path("servList");

                        if (list.isArray()) {
                            for (JsonNode node : list) {
                                allItems.add(xmlMapper.convertValue(node, new TypeReference<>() {}));
                            }
                        } else if (!list.isMissingNode()) {
                            allItems.add(xmlMapper.convertValue(list, new TypeReference<>() {}));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }, executor));
            }

            // 3. 모든 요청 완료될 때까지 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            executor.shutdown();
            
            long end = System.currentTimeMillis(); // ⏱ 끝 시간
            double durationSec = (end - start) / 1000.0;
            System.out.println("⏱ 전체 응답 시간: " + durationSec + "초");


            return Map.of("servList", allItems);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("전체 복지 데이터 호출 실패", e);
        }
    }

    private String fetchXml(String urlStr) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Accept", "application/xml");

        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            return response.toString();
        }
    }
    
    @GetMapping("/reverse-geocode")
    public ResponseEntity<String> reverseGeocode(
        @RequestParam("lon") double lon, 
        @RequestParam("lat") double lat
    ) throws IOException {
        String apiKey = "6D96057A-FC81-30BE-B98E-39266237CBD1";

        String url = "https://api.vworld.kr/req/address?service=address" +
                     "&request=getAddress" +
                     "&version=2.0&format=json&type=PARCEL" +
                     "&point=" + lon + "," + lat +
                     "&crs=epsg:4326&key=" + apiKey;

        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestMethod("GET");

        try (BufferedReader in = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {

            StringBuilder response = new StringBuilder();
            String line;

            while ((line = in.readLine()) != null) {
                response.append(line);
            }

            return ResponseEntity.ok(response.toString());
        }
    }
    
    
    @GetMapping("/youth-policy")
    public ResponseEntity<Map<String, Object>> proxyYouthPolicy(
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

        // JSON 문자열을 JsonNode로 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode root = objectMapper.readTree(response.toString());

        // 필요한 데이터만 골라서 반환 (예: result.totalCount, result.youthPolicyList)
        JsonNode resultNode = root.path("result");
        int totalCount = resultNode.path("totalCount").asInt();
        JsonNode list = resultNode.path("youthPolicyList");

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("result", Map.of(
            "totalCount", totalCount,
            "youthPolicyList", objectMapper.convertValue(list, List.class)
        ));
        return ResponseEntity.ok(resultMap);
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

            int responseCode = conn.getResponseCode();
            
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder responseStrBuilder = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) responseStrBuilder.append(line);
            in.close();

            String responseStr = responseStrBuilder.toString();
            
            JsonNode root = xmlMapper.readTree(responseStr);

            return Map.of("detail", root); // ✅ 핵심 수정 포인트

        } catch (Exception e) {
            System.err.println("❗ 복지 상세정보 조회 중 예외 발생:");
            e.printStackTrace();
            throw new RuntimeException("복지 상세정보 조회 실패", e);
        }
    }
}