package edu.kh.project.API.model.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import edu.kh.project.API.model.dto.SeoulWelfareAPI;

@Service
public class SeoulWelfareServiceImpl implements SeoulWelfareService{

	@Value("${seoul.api.key}")
	private String apiKey; // 실제 인증키로 대체 필요

	@Override
	public List<SeoulWelfareAPI> getAllServices() {
		 List<SeoulWelfareAPI> result = new ArrayList<>();
		    
		    try {
		        String url = "http://openapi.seoul.go.kr:8088/" + apiKey + "/json/ListPublicReservationCulture/1/1000";
		        
		        RestTemplate restTemplate = new RestTemplate();
		        String response = restTemplate.getForObject(url, String.class);

		        if (!response.trim().startsWith("{")) {
		            System.err.println("❌ JSON 아님! 응답:\n" + response.substring(0, 200));
		            return Collections.emptyList();
		        }
		        
		        ObjectMapper mapper = new ObjectMapper();
		        mapper.registerModule(new JavaTimeModule()); // LocalDateTime용
		        JsonNode root = mapper.readTree(response);
		        JsonNode rows = root.path("ListPublicReservationCulture").path("row");

		        for (JsonNode node : rows) {
		        	SeoulWelfareAPI dto = mapper.treeToValue(node, SeoulWelfareAPI.class);
		            System.out.println("✅ DTO 변환 성공: " + dto); // 👈 null 여부 확인
		            result.add(dto);
		        }
		    } catch (Exception e) {
		    	System.err.println("❌ 매핑 실패: ");
		        e.printStackTrace();
		    }

		    return result;
		
	}

}
