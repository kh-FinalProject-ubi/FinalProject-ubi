package edu.kh.project.welfare.facility.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.kh.project.welfare.facility.dto.BusanFacility;
import lombok.extern.slf4j.Slf4j;

@Service
@EnableAsync
@Slf4j
public class BusanFacilityServiceImpl implements BusanFacilityService {

	@Value("${busan.api.key}")
	private String serviceKey;

	private final RestTemplate restTemplate = new RestTemplate();

	private static final Map<String, List<String>> apiUrlMap = Map.of(
			"부산광역시|장애인복지",
			List.of("https://apis.data.go.kr/6260000/BusanDisabledFacService/getDisabledFacilityInfo"),
			"부산광역시|아동복지",
			List.of("https://apis.data.go.kr/6260000/ChildWelfareService/ChildWelfareFacilityInfo"),
			"부산광역시|노인복지",
			List.of("https://api.odcloud.kr/api/15071152/v1/uddi:7b6bb047-1b65-4419-b152-b226cfd2ba7e"),
			"부산광역시|정신보건시설",
			List.of("https://api.odcloud.kr/api/15066738/v1/uddi:a814ee57-4911-4a0f-8f7f-b2da3f742c73"),
			"부산광역시|장애인보호",
			List.of("https://api.odcloud.kr/api/15042650/v1/uddi:f542f98c-d366-44f0-bd66-d85e47b44ada_202001231745"),
			"중구|노인복지",
			List.of("https://api.odcloud.kr/api/3072419/v1/uddi:8770624d-3241-4fe7-8797-f7e53e34334d"), 
			"중구|사회복지",
			List.of("https://api.odcloud.kr/api/3073914/v1/uddi:5eb596d1-95bf-4c52-868e-ccf5a2c8f53b_202002131636"), 
			"서구|노인복지",
			List.of("https://api.odcloud.kr/api/15008060/v1/uddi:804761b5-f7ba-4b1d-997c-97b89004b031"),
			"서구|사회복지",
			List.of("https://api.odcloud.kr/api/3081345/v1/uddi:d82dbb22-c109-41ff-81fd-cb6580475dd3")
			
			);

	// 병렬 호출 (오버로드 버전)
	@Async
	public CompletableFuture<List<BusanFacility>> fetchApi(String url, String districtFilter) {
		try {
			String fullUrl = url.contains("?") ? url + "&serviceKey=" + serviceKey : url + "?serviceKey=" + serviceKey;

			String response = restTemplate.getForObject(fullUrl, String.class);
			return CompletableFuture.completedFuture(parseFacilityData(response, districtFilter, url));
		} catch (Exception e) {
			log.warn("❗API 호출 실패: {}", url, e);
			return CompletableFuture.completedFuture(Collections.emptyList());
		}
	}

	@Override
	@Cacheable(value = "facilityCache", key = "#district + '|' + #category")
	public List<BusanFacility> getFacilities(String district, String category) {
		String key = district + "|" + category;
		List<String> urls = apiUrlMap.getOrDefault(key, Collections.emptyList());

		// 시 전체 API 조회용
		if (urls.isEmpty()) {
			key = "부산광역시|" + category;
			urls = apiUrlMap.getOrDefault(key, Collections.emptyList());
		}

		List<CompletableFuture<List<BusanFacility>>> futures = new ArrayList<>();
		for (String url : urls) {
			futures.add(fetchApi(url, district)); // 필터링용 district 전달
		}

		CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

		return futures.stream().flatMap(f -> f.join().stream()).collect(Collectors.toList());
	}

	// JSON 파싱 with district 필터링
	private List<BusanFacility> parseFacilityData(String rawJson, String districtFilter, String url) {
		List<BusanFacility> list = new ArrayList<>();
		try {
	        ObjectMapper mapper = new ObjectMapper();
	        JsonNode root = mapper.readTree(rawJson);
	        JsonNode dataNode = root.has("data") ? root.path("data")
	                : root.has("body") ? root.path("body").path("items") : root;

	        for (JsonNode item : dataNode) {
	            BusanFacility dto = new BusanFacility();

	            // 1️⃣ 구군 기반 필터링이 가능한 경우
	            if (item.has("구군")) {
	                String district = item.path("구군").asText("");
	                if (!district.equals(districtFilter)) continue;

	                dto.setFacilityName(item.path("장기요양기관").asText(""));
	                dto.setAddress(item.path("주소").asText(""));
	                dto.setPhone(item.path("전화번호").asText(""));
	                dto.setCategory(item.path("급여종류").asText(""));
	                dto.setDistrict(district);
	                dto.setFoundingYear(item.path("설립연도").asText(""));
	                dto.setArea(item.path("연면적(제곱미터)").asText(""));
	                dto.setLatitude(parseDouble(item.path("위도").asText()));
	                dto.setLongitude(parseDouble(item.path("경도").asText()));
	            }

	            // 2️⃣ 구군이 없는 시 전체 데이터 (예: 노인요양시설)
	            else if (url.contains("8770624d")) { // 또는 "15071152" 로 체크 가능
	                dto.setFacilityName(item.path("시설명").asText(""));
	                dto.setAddress(item.path("소재지도로명주소").asText(""));
	                dto.setPhone(item.path("전화번호").asText(""));
	                dto.setCategory(item.path("시설유형").asText(""));
	                dto.setManagingAgency(item.path("관리기관명").asText(""));
	                dto.setDataReferenceDate(item.path("데이터기준일자").asText(""));
	                dto.setDistrict("부산광역시"); // 시 전체 데이터는 고정
	            }

	            // 추가될 때만 리스트에 포함
	            if (dto.getFacilityName() != null && !dto.getFacilityName().isEmpty()) {
	                list.add(dto);
	            }
	        }

	    } catch (Exception e) {
	        log.warn("❌ JSON 파싱 실패", e);
	    }
	    return list;
	}

	// 안전한 숫자 파싱
	private Double parseDouble(String str) {
		try {
			return Double.parseDouble(str);
		} catch (NumberFormatException e) {
			return null;
		}
	}
}