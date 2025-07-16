package edu.kh.project.welfare.facility.service;

import static java.util.Map.entry;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.IncheonFacility;
import lombok.extern.slf4j.Slf4j;

@Service
@EnableAsync
@Slf4j
public class IncheonFacilityServiceImpl implements IncheonFacilityService {

	@Value("${incheon.api.key}")
	private String serviceKey;

	private final RestTemplate restTemplate = new RestTemplate();

	@Lazy
	@Autowired
	private IncheonFacilityService selfProxy;

	private static final Map<String, List<String>> apiUrlMap = Map.ofEntries(
			entry("중구|노인의료복지",
					List.of("https://api.odcloud.kr/api/3079657/v1/uddi:ab663281-1316-45a5-8353-f285c0eb51ec")),
			entry("중구|여성복지", 
					List.of("https://api.odcloud.kr/api/15067056/v1/uddi:fe9221c6-ff29-4b1f-b31a-a3abd54cee9c")),
			entry("중구|장애인복지",
					List.of("https://api.odcloud.kr/api/3079646/v1/uddi:d2d90b19-c5bf-4a4c-981c-d651239861cf")),
			entry("중구|장애인복지",
					List.of("https://api.odcloud.kr/api/3079646/v1/uddi:d2d90b19-c5bf-4a4c-981c-d651239861cf"))
			);

	@Async
	public CompletableFuture<List<IncheonFacility>> fetchApi(String url, String districtFilter) {
		log.info("🚀 [Incheon] 비동기 호출 시작: {}", url);

		try {
			String fullUrl = url + "?serviceKey=" + serviceKey + "&page=1" + "&perPage=100";

			String response = restTemplate.getForObject(fullUrl, String.class);
			JsonNode root;

			// JSON인지 XML인지 판별
			if (response.trim().startsWith("{")) {
				ObjectMapper jsonMapper = new ObjectMapper();
				root = jsonMapper.readTree(response);
			} else {
				XmlMapper xmlMapper = new XmlMapper();
				root = xmlMapper.readTree(response);
			}

			log.info("✅ [Incheon] 응답 완료: {}", url);

			return CompletableFuture.completedFuture(parseFacilityData(root, districtFilter, url));

		} catch (Exception e) {
			log.warn("❗[Incheon] API 호출 실패: {}", url, e);
			return CompletableFuture.completedFuture(Collections.emptyList());
		}
	}

	@Override
	@Cacheable(value = "facilityCache", key = "#district + '|' + #category")
	public List<IncheonFacility> getFacilities(String district, String category) {

		if (category == null || category.isBlank()) {
			category = "전체";
		}

		log.info("📌 [Incheon] getFacilities() 호출됨 - district: {}, category: {}", district, category);

		// 🔑 Key는 "남동구|노인복지" 와 같은 형태
		String key = district.replace("인천광역시 ", "") + "|" + category;

		List<String> urls = apiUrlMap.getOrDefault(key, Collections.emptyList());

		log.info("📦 호출 대상 URL 수: {}", urls.size());
		urls.forEach(url -> log.info("➡️ 호출 대상 URL: {}", url));

		if (urls.isEmpty())
			return Collections.emptyList();

		List<CompletableFuture<List<IncheonFacility>>> futures = new ArrayList<>();
		for (String url : urls) {
			futures.add(selfProxy.fetchApi(url, district)); // 🚨 fetchApi 리턴타입도 IncheonFacility
		}

		// 병렬 실행 완료까지 대기
		CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

		// 결과 통합
		return futures.stream().flatMap(f -> f.join().stream()).collect(Collectors.toList());
	}

	private List<IncheonFacility> parseFacilityData(JsonNode root, String districtFilter, String url) {
		List<IncheonFacility> result = new ArrayList<>();

		JsonNode itemsNode = root.path("data");
		if (itemsNode.isMissingNode() || !itemsNode.isArray())
			return result;

		for (JsonNode item : itemsNode) {
			String address = getFirst(item, "소재지도로명주소", "소재지지번주소", "주소", "소재지", "road_address");

			// 📌 주소에 필터된 구군이 포함되지 않으면 제외
			if (address != null && !address.contains(districtFilter))
				continue;

			IncheonFacility dto = new IncheonFacility();

			 dto.setFacilityName(getFirst(item, "시설명"));
		        dto.setAddress(address);
		        dto.setPhone(getFirst(item, "연락처", "전화번호"));
		        dto.setCapacity(getFirst(item, "정원"));
		        dto.setDataDate(getFirst(item, "데이터기준일"));
		        dto.setDistrict(districtFilter);
		        dto.setCategory(url); // 임시로 URL로 구분
		        
		        dto.setFacilityName(getFirst(item, "명칭"));
		        dto.setCategory(getFirst(item, "구분"));
		        dto.setAddress(address);
		        dto.setPhone(getFirst(item, "전화번호"));
		        dto.setFax(getFirst(item, "팩스"));
		        dto.setDataDate(getFirst(item, "데이터기준일자"));
		        dto.setDistrict(districtFilter);
		        
		        dto.setFacilityName(getFirst(item, "시설명"));
		        dto.setFacilityType(getFirst(item, "시설구분"));
		        dto.setAddress(address);
		        dto.setPhone(getFirst(item, "전화번호"));
		        dto.setScale(getFirst(item, "시설규모(제곱미터)"));
		        dto.setStaffCount(getFirst(item, "종사자수"));
		        dto.setEstablishDate(getFirst(item, "설립일자"));
		        dto.setDataDate(getFirst(item, "데이터기준일자"));
		        dto.setDistrict(districtFilter);


			result.add(dto);
		}

		return result;
	}

	private String getFirst(JsonNode item, String... keys) {
		for (String key : keys) {
			if (item.has(key) && !item.get(key).asText().isBlank()) {
				return item.get(key).asText();
			}
		}
		return null;
	}

	private Double parseDouble(JsonNode item, String... keys) {
		String value = getFirst(item, keys);
		try {
			return value != null ? Double.parseDouble(value) : null;
		} catch (NumberFormatException e) {
			return null;
		}
	}
}
