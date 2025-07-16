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
			entry("중구|재가노인복지",
					List.of("https://api.odcloud.kr/api/15072262/v1/uddi:80f4e422-58df-418e-a5e5-95c940ab49a7")),
			entry("중구|청소년복지",
					List.of("https://api.odcloud.kr/api/15066588/v1/uddi:7311017c-3cdb-42f8-9c09-8478ba1df6ff")),
			entry("중구|노인교실",
					List.of("https://api.odcloud.kr/api/15038691/v1/uddi:589cf85a-41b7-41d9-a5a3-9ab937ea6ff5")),
			entry("중구|노인복지",
					List.of("https://api.odcloud.kr/api/15133999/v1/uddi:62394c2f-3d8a-4b25-82b1-a9409644123a")),
			entry("동구|노인복지",
					List.of("https://api.odcloud.kr/api/15098031/v1/uddi:1bb2eaa8-a391-434e-93c4-8942ce80df9b")),
			entry("동구|노인요양",
					List.of("https://api.odcloud.kr/api/15031810/v1/uddi:de86bbc2-01cc-4574-94ce-f763c99bc07e")),
			entry("동구|장애인복지",
					List.of("https://api.odcloud.kr/api/15098032/v1/uddi:93a70688-892f-45ec-8ccf-f30a8e5141f7")),
			entry("미추홀구|장애인복지",
					List.of("https://api.odcloud.kr/api/15011882/v1/uddi:380f165a-9500-4c26-b792-b0b314ad72c2_201910101309")),
			entry("미추홀구|노인복지",
					List.of("https://api.odcloud.kr/api/15070559/v1/uddi:eae3eb26-6d5c-427a-9d96-acd687b9bee7")),
			entry("미추홀구|지역아동",
					List.of("https://api.odcloud.kr/api/15011892/v1/uddi:7624e013-b8e9-49af-8976-b2449672f51d"))

					List.of("https://api.odcloud.kr/api/3079646/v1/uddi:d2d90b19-c5bf-4a4c-981c-d651239861cf"))
//			,
//			entry("중구|장애인복지",
//					List.of("https://api.odcloud.kr/api/3079646/v1/uddi:d2d90b19-c5bf-4a4c-981c-d651239861cf"))

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

			dto.setFacilityName(getFirst(item, "시설명", "명칭"));
			dto.setFacilityType(getFirst(item, "시설종류", "시설유형", "시설구분"));
			dto.setCategory(getFirst(item, "종류", "구분", "카테고리", "CATEGORY"));
			dto.setAddress(getFirst(item, "주소", "도로명주소", "지번주소", "소재지"));
			dto.setPhone(getFirst(item, "전화번호", "연락처"));
			dto.setFax(getFirst(item, "팩스"));
			dto.setOperator(getFirst(item, "운영주체(법인명)", "운영주체"));
			dto.setNote(getFirst(item, "운영내용", "비고", "특이사항"));
			dto.setCapacity(getFirst(item, "정원(명)", "정원"));
			dto.setCurrentResidents(getFirst(item, "수용인원"));
			dto.setScale(getFirst(item, "시설규모(제곱미터)", "건축물규모"));
			dto.setStaffCount(getFirst(item, "종사자수"));
			dto.setEstablishDate(getFirst(item, "지정일자", "설립일자", "건축허가일"));
			dto.setLatitude(parseDouble(item, "위도"));
			dto.setLongitude(parseDouble(item, "경도"));
			dto.setDataDate(getFirst(item, "데이터기준일", "데이터기준일자"));
			dto.setDistrict(districtFilter);

			dto.setCompositeBuilding(getFirst(item, "복합건물여부"));
			dto.setDayStaff(getFirst(item, "주간인력"));
			dto.setNightStaff(getFirst(item, "야간인력"));
			dto.setElderlyCount(getFirst(item, "노인수"));
			dto.setEvacuationSpace(getFirst(item, "대피공간설치여부"));
			dto.setSmokeControl(getFirst(item, "배연및제연설비설치여부"));
			dto.setExteriorFinish(getFirst(item, "외벽마감재료"));
			dto.setDirectStairs(getFirst(item, "직통계단"));
			dto.setEmergencyExit(getFirst(item, "비상구여부"));
			dto.setEvacuationEquipment(getFirst(item, "피난기구"));
			dto.setSprinkler(getFirst(item, "스프링클러설치여부"));
			dto.setSimpleSprinkler(getFirst(item, "간이스프링클러설치여부"));
			dto.setAutoFireDetection(getFirst(item, "자동화재탐지설비설치여부"));
			dto.setAutoFireAlert(getFirst(item, "자동화재속보설비여부"));
			dto.setSmokeAlarm(getFirst(item, "단독경보형감지기설치여부"));
			
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
