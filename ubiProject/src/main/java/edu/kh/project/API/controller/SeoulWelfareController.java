package edu.kh.project.API.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.API.model.dto.SeoulWelfareAPI;
import edu.kh.project.API.model.dto.SeoulFacility;
import edu.kh.project.API.model.service.SeoulWelfareService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SeoulWelfareController {

    private final SeoulWelfareService seoulService;

    @GetMapping("/api/services")
    public List<SeoulWelfareAPI> getAllServices() {
        return seoulService.getAllServices();
    }
    
    @GetMapping("/kid/facility")
    public ResponseEntity<String> getFacilityInfo(
            @RequestParam(name = "lon") double lon,
            @RequestParam(name = "lat") double lat,
            @RequestParam(value = "buffer", required = false, defaultValue = "50000") int buffer
        ) {
        try {
            String apiKey = "46AE2AAC-F42F-3A6E-AD7E-D0826911ED76";

            String geom = URLEncoder.encode("POINT(" + lon + " " + lat + ")", StandardCharsets.UTF_8);

            // 페이지, 사이즈는 제거 (일단 최대 사이즈 요청)
            String url = "https://api.vworld.kr/req/data?"
            		  + "service=data"
            		  + "&version=2.0"
            		  + "&request=GetFeature"
            		  + "&key=" + apiKey
            		  + "&format=json"
            		  + "&data=LT_P_MGPRTFC"
            		  + "&geomFilter=" + geom
            		  + "&buffer=" + buffer
            		  + "&srs=EPSG:4326"
            		  + "&domain=http://localhost:5173"
            		  + "&size=1000";  // 최대 1000개까지 한번에 받기 예시

            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");

            int responseCode = conn.getResponseCode();

            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                return ResponseEntity.ok(response.toString());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("API 호출 실패: " + e.getMessage());
        }
    }
}