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

import edu.kh.project.welfare.facility.dto.GwangjuFacility;
import lombok.extern.slf4j.Slf4j;

@Service
@EnableAsync
@Slf4j
public class GwangjuFacilityServiceImpl implements GwangjuFacilityService {

	@Value("${gwangju.api.key}")
	private String serviceKey;

	private final RestTemplate restTemplate = new RestTemplate();

	@Lazy
	@Autowired
	private GwangjuFacilityService selfProxy;

	private static final Map<String, List<String>> apiUrlMap = Map.ofEntries(
			entry("동구|노인복지",
					List.of("https://api.odcloud.kr/api/15010943/v1/uddi:687f4975-0e27-40cc-9300-f87c835456e7")),
			entry("동구|공공체육시설",
					List.of("https://api.odcloud.kr/api/15010914/v1/uddi:0a507bcf-7f7e-4a3c-a3df-b53ff21d9076")),
			entry("동구|경로당",
					List.of("https://api.odcloud.kr/api/15106974/v1/uddi:51b3502e-54a8-4a98-98a3-f683c7225cbe")),
			entry("동구|장애인시설",
					List.of("https://api.odcloud.kr/api/15108599/v1/uddi:a07abd8a-5f4b-4cdd-9703-8830f691b5f1")),
			entry("서구|체육시설",
					List.of("https://api.odcloud.kr/api/3033262/v1/uddi:90b84428-cfa7-45bc-89e5-a03b5adbf503")),
			entry("서구|행정복지센터",
					List.of("https://api.odcloud.kr/api/15033518/v1/uddi:abe09597-fe96-45e3-aa9c-ad1028e2a8c8")),
			entry("서구|청소년시설",
					List.of("https://api.odcloud.kr/api/15011812/v1/uddi:73f04187-ee74-4933-b3a4-9440619a86d6")),
			entry("서구|노인복지시설",
					List.of("https://api.odcloud.kr/api/15134789/v1/uddi:f8030045-9ca5-4729-8c0f-d7a29f0719eb")),
			entry("남구|공공체육시설",
					List.of("https://api.odcloud.kr/api/15083779/v1/uddi:16a7cfed-a220-4843-a744-d66d8619301e")),
			entry("남구|행정복지센터",
					List.of("https://api.odcloud.kr/api/15122292/v1/uddi:7eb3e1a1-49e9-408b-ad19-a1e125835299")),
			entry("남구|장애인복지시설",
					List.of("https://api.odcloud.kr/api/15116423/v1/uddi:fb114434-594a-45e3-96e6-9a07a2a102aa")),
			entry("남구|경로당",
					List.of("https://api.odcloud.kr/api/15122455/v1/uddi:cb22072e-4c41-4d39-bf7b-c3e1c04ec2f4")),
			entry("남구|청소년시설",
					List.of("https://api.odcloud.kr/api/15139090/v1/uddi:8fb35296-1412-4d19-901c-fe089b4ded17")),
			entry("북구|장애인시설",
					List.of("https://api.odcloud.kr/api/15068629/v1/uddi:3e61cd82-7407-43cc-a46b-9439ee0a2e13")),
			entry("북구|청소년문화시설",
					List.of("https://api.odcloud.kr/api/15068722/v1/uddi:f5b20ce5-3244-4c0c-9a89-8e927cd6af32")),
			entry("북구|노인복지관",
					List.of("https://api.odcloud.kr/api/15068639/v1/uddi:69617bfb-5ab2-496c-a4c1-e2e416f82ea0")),
			entry("북구|실외체육시설",
					List.of("https://api.odcloud.kr/api/15075102/v1/uddi:54944673-70f9-46f2-a89c-f9c661e459fe")),
			entry("북구|지역아동센터",
					List.of("https://api.odcloud.kr/api/15118520/v1/uddi:e4fbfcb8-d69a-442f-9210-c0c1ba73b1a2")),
			entry("북구|노인요양원",
					List.of("https://api.odcloud.kr/api/15118518/v1/uddi:47773c86-21cb-459c-b1ae-ce704845fc92")),
			entry("광산구|노인복지시설",
					List.of("https://api.odcloud.kr/api/15055944/v1/uddi:08fa5748-7022-4bc1-b3fa-fd0f39d531cc")),
			entry("광산구|장애인복지시설",
					List.of("https://api.odcloud.kr/api/3082278/v1/uddi:cb0d0a7a-cec7-4d4b-a5af-b92e4b5219d2")),
			entry("광산구|한부모가족복지시설",
					List.of("https://api.odcloud.kr/api/15055950/v1/uddi:c282522b-7edb-4ecf-9b03-e9289f35e51d")),
			entry("광산구|행정복지센터",
					List.of("https://api.odcloud.kr/api/15013792/v1/uddi:54181df1-063f-4aef-b8cc-f201574a9a2a")),
			entry("광산구|청소년시설",
					List.of("https://api.odcloud.kr/api/3082272/v1/uddi:62b4c671-6908-4520-aaaf-ed9ad28c50f2")),
			entry("광산구|체육시설",
					List.of("https://api.odcloud.kr/api/15055919/v1/uddi:e128eaa8-0d46-49ea-8e32-9db6891ed77f")),
			entry("광산구|상담시설",
					List.of("https://api.odcloud.kr/api/15039657/v1/uddi:7d264a43-16ca-4bb4-bd10-b5dcfe6b183b")),
			entry("광산구|종합사회복지관",
					List.of("https://api.odcloud.kr/api/15055949/v1/uddi:d2a67f3b-6dc1-46b0-8206-ab0b434e1565")),
			entry("광산구|아동복지시설",
					List.of("https://api.odcloud.kr/api/15055946/v1/uddi:a3ea73fd-32bf-4596-812c-c372434b7b97")),
			entry("동구|전체",
					List.of("https://api.odcloud.kr/api/15010943/v1/uddi:687f4975-0e27-40cc-9300-f87c835456e7",
							"https://api.odcloud.kr/api/15010914/v1/uddi:0a507bcf-7f7e-4a3c-a3df-b53ff21d9076",
							"https://api.odcloud.kr/api/15106974/v1/uddi:51b3502e-54a8-4a98-98a3-f683c7225cbe",
							"https://api.odcloud.kr/api/15108599/v1/uddi:a07abd8a-5f4b-4cdd-9703-8830f691b5f1")),
			entry("서구|전체",
					List.of("https://api.odcloud.kr/api/3033262/v1/uddi:90b84428-cfa7-45bc-89e5-a03b5adbf503",
							"https://api.odcloud.kr/api/15033518/v1/uddi:abe09597-fe96-45e3-aa9c-ad1028e2a8c8",
							"https://api.odcloud.kr/api/15011812/v1/uddi:73f04187-ee74-4933-b3a4-9440619a86d6",
							"https://api.odcloud.kr/api/15134789/v1/uddi:f8030045-9ca5-4729-8c0f-d7a29f0719eb")),

			entry("남구|전체", List.of("https://api.odcloud.kr/api/15083779/v1/uddi:16a7cfed-a220-4843-a744-d66d8619301e", // 공공체육시설
					"https://api.odcloud.kr/api/15122292/v1/uddi:7eb3e1a1-49e9-408b-ad19-a1e125835299", // 행정복지센터
					"https://api.odcloud.kr/api/15116423/v1/uddi:fb114434-594a-45e3-96e6-9a07a2a102aa", // 장애인복지시설
					"https://api.odcloud.kr/api/15122455/v1/uddi:cb22072e-4c41-4d39-bf7b-c3e1c04ec2f4", // 경로당
					"https://api.odcloud.kr/api/15139090/v1/uddi:8fb35296-1412-4d19-901c-fe089b4ded17" // 청소년시설
			)),
			entry("북구|전체", List.of("https://api.odcloud.kr/api/15068629/v1/uddi:3e61cd82-7407-43cc-a46b-9439ee0a2e13", // 장애인시설
					"https://api.odcloud.kr/api/15068722/v1/uddi:f5b20ce5-3244-4c0c-9a89-8e927cd6af32", // 청소년문화시설
					"https://api.odcloud.kr/api/15068639/v1/uddi:69617bfb-5ab2-496c-a4c1-e2e416f82ea0", // 노인복지관
					"https://api.odcloud.kr/api/15075102/v1/uddi:54944673-70f9-46f2-a89c-f9c661e459fe", // 실외체육시설
					"https://api.odcloud.kr/api/15118520/v1/uddi:e4fbfcb8-d69a-442f-9210-c0c1ba73b1a2", // 지역아동센터
					"https://api.odcloud.kr/api/15118518/v1/uddi:47773c86-21cb-459c-b1ae-ce704845fc92" // 노인요양원
			)),
			entry("광산구|전체", List.of("https://api.odcloud.kr/api/15055944/v1/uddi:08fa5748-7022-4bc1-b3fa-fd0f39d531cc", // 노인복지시설
					"https://api.odcloud.kr/api/3082278/v1/uddi:cb0d0a7a-cec7-4d4b-a5af-b92e4b5219d2", // 장애인복지시설
					"https://api.odcloud.kr/api/15055950/v1/uddi:c282522b-7edb-4ecf-9b03-e9289f35e51d", // 한부모가족복지시설
					"https://api.odcloud.kr/api/15013792/v1/uddi:54181df1-063f-4aef-b8cc-f201574a9a2a", // 행정복지센터
					"https://api.odcloud.kr/api/3082272/v1/uddi:62b4c671-6908-4520-aaaf-ed9ad28c50f2", // 청소년시설
					"https://api.odcloud.kr/api/15055919/v1/uddi:e128eaa8-0d46-49ea-8e32-9db6891ed77f", // 체육시설
					"https://api.odcloud.kr/api/15039657/v1/uddi:7d264a43-16ca-4bb4-bd10-b5dcfe6b183b", // 상담시설
					"https://api.odcloud.kr/api/15055949/v1/uddi:d2a67f3b-6dc1-46b0-8206-ab0b434e1565", // 종합사회복지관
					"https://api.odcloud.kr/api/15055946/v1/uddi:a3ea73fd-32bf-4596-812c-c372434b7b97" // 아동복지시설
			))

	);

	@Async
	public CompletableFuture<List<GwangjuFacility>> fetchApi(String url, String districtFilter) {
		log.info("🚀 비동기 호출 시작: {}", url);

		try {
			String fullUrl = url + "?serviceKey=" + serviceKey + "&page=1" + "&perPage=100";

			String response = restTemplate.getForObject(fullUrl, String.class);

			JsonNode root;

			// JSON인지 XML인지 판별 후 파싱
			if (response.trim().startsWith("{")) {
				ObjectMapper jsonMapper = new ObjectMapper();
				root = jsonMapper.readTree(response);
			} else {
				XmlMapper xmlMapper = new XmlMapper();
				root = xmlMapper.readTree(response);
			}

			log.info("✅ 응답 완료: {}", url);

			return CompletableFuture.completedFuture(parseFacilityData(root, districtFilter, url));

		} catch (Exception e) {
			log.warn("❗ API 호출 실패: {}", url, e);
			return CompletableFuture.completedFuture(Collections.emptyList());
		}
	}

	@Override
	@Cacheable(value = "facilityCache", key = "#district + '|' + #category")
	public List<GwangjuFacility> getFacilities(String district, String category) {

		if (district == null || district.isBlank() || district.equals("전체")) {
			log.info("⛔ '전체' 선택됨 → API 호출 생략");
			return Collections.emptyList();
		}

		if (category == null || category.isBlank()) {
			category = "전체";
		}

		log.info("📌 getFacilities() 호출됨 - district: {}, category: {}", district, category);

		// 🔑 Key를 항상 광주광역시 기준으로 구성 (예: "동구|공공체육시설")
		String key = district.replace("광주광역시 ", "") + "|" + category;

		List<String> urls = apiUrlMap.getOrDefault(key, Collections.emptyList());

		log.info("📦 호출 대상 URL 수: {}", urls.size());
		urls.forEach(url -> log.info("➡️ 호출 대상 URL: {}", url));

		if (urls.isEmpty())
			return Collections.emptyList();

		List<CompletableFuture<List<GwangjuFacility>>> futures = new ArrayList<>();
		for (String url : urls) {
			futures.add(selfProxy.fetchApi(url, district));
		}

		CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

		return futures.stream().flatMap(f -> f.join().stream()).collect(Collectors.toList());
	}

	private List<GwangjuFacility> parseFacilityData(JsonNode root, String districtFilter, String url) {
		List<GwangjuFacility> result = new ArrayList<>();

		JsonNode itemsNode = root.path("data");
		if (itemsNode.isMissingNode() || !itemsNode.isArray())
			return result;

		for (JsonNode item : itemsNode) {
			String address = getFirst(item, "소재지도로명주소", "소재지지번주소", "주소", "소재지", "도로명주소");

			// 실제 주소에 districtFilter 포함 안되면 스킵
			if (address != null && !address.contains(districtFilter))
				continue;

			GwangjuFacility dto = new GwangjuFacility();
			
			dto.setFacilityName(getFirst(item, "시설명", "기관명", "시설명칭", "경로당명", "명칭"));		
			dto.setAddress(getFirst(item, "시설도로명주소", "소재지도로명주소", "소재지지번주소", "도로명주소", "소재지", "주소", "소재지주소"));	
			dto.setPhone(getFirst(item, "전화번호", "연락처", "기관전화번호"));	
			dto.setDistrict(districtFilter);	
			dto.setLatitude(parseDouble(item, "위도", "lat", "LAT"));
			dto.setLongitude(parseDouble(item, "경도", "lon", "LNG"));

			dto.setType(getFirst(item, "종류", "분류", "카테고리"));	
			dto.setFacilityType(getFirst(item, "시설", "시설유형", "시설종류", "유형"));	
			dto.setFacilityKind(getFirst(item, "시설종류")); 
			dto.setCategoryType(getFirst(item, "구분", "시설구분"));	

			dto.setAdministrativeDong(getFirst(item, "행정동명", "행정동", "법정동명", "동명"));	
			dto.setDongName(getFirst(item, "동명"));	

			dto.setSeniorCenterName(getFirst(item, "경로당명"));	
			dto.setForm(getFirst(item, "형태"));	
			dto.setHall(getFirst(item, "당 장"));	

			dto.setArea(getFirst(item, "면적", "면적(제곱미터)"));	
			dto.setBuildDate(getFirst(item, "조성일자"));	
			dto.setBuildYear(getFirst(item, "건립연도"));	
			dto.setFacilityStatus(getFirst(item, "이용시설현황", "시설 현황", "주요시설"));	
			dto.setCapacityStatus(getFirst(item, "수용정원_현원(명)", "수용정원", "정원", "수용인원"));	
			dto.setEmployee(getFirst(item, "종사자"));	
			dto.setNote(getFirst(item, "비고", "운영내용"));	

			dto.setCreatedYear(getFirst(item, "조성연도"));	
			dto.setFitnessEquipment(getFirst(item, "체력단련시설"));	
			dto.setLocation(getFirst(item, "위치"));	
			dto.setDepartment(getFirst(item, "담당부서"));	
			dto.setOperator(getFirst(item, "운영주체"));	
			dto.setManagingAgency(getFirst(item, "관리기관명", "담당기관", "자치단체명"));	

			dto.setHomepage(getFirst(item, "홈페이지"));	
			
			
			dto.setEventType(getFirst(item, "종목"));	

			dto.setWeekdayOperationDays(getFirst(item, "평일 운영요일", "평일운영요일"));	
			dto.setWeekdayStartTime(getFirst(item, "평일 운영 시작시간", "평일운영시작시간"));	
			dto.setWeekdayEndTime(getFirst(item, "평일 운영 종료시간", "평일운영종료시간"));	
			dto.setWeekendOperationDays(getFirst(item, "주말 운영요일", "주말운영요일"));	
			dto.setWeekendStartTime(getFirst(item, "주말 운영 시작시간", "주말운영시작시간"));	
			dto.setWeekendEndTime(getFirst(item, "주말 운영 종료시간", "주말운영종료시간"));	
			dto.setClosedDays(getFirst(item, "휴관일"));	

			dto.setBuildingFloor(getFirst(item, "건축물층수"));	
			dto.setTotalFloorArea(getFirst(item, "연면적"));	

			dto.setDataDate(getFirst(item, "데이터기준일자", "데이터 기준일자"));	

			dto.setYear(getFirst(item, "연도"));	
			dto.setHomeCareServiceCount(getFirst(item, "방문요양서비스"));	
			dto.setDayNightCareServiceCount(getFirst(item, "주야간보호서비스"));	
			dto.setShortTermCareServiceCount(getFirst(item, "단기보호서비스"));	
			dto.setHomeBathServiceCount(getFirst(item, "방문목욕서비스"));	
			dto.setHomeSupportServiceCount(getFirst(item, "재가노인지원서비스"));	
			dto.setSeniorCenterCount(getFirst(item, "경로당"));	
			dto.setSeniorSchoolCount(getFirst(item, "노인교실"));	
			dto.setSeniorWelfareCenterCount(getFirst(item, "노인복지관"));	
			dto.setNursingFacilityCount(getFirst(item, "노인요양시설"));	
			dto.setNursingGroupHomeCount(getFirst(item, "노인요양공동생활가정"));	
			
			dto.setFacilityKind(getFirst(item, "시설종류"));        // 시설의 종류
			dto.setFacilityName(getFirst(item, "시설명"));          // 시설명
			dto.setAddress(getFirst(item, "소재지"));               // 주소
			dto.setCapacityStatus(getFirst(item, "정원"));          // 수용 정원
			dto.setPhone(getFirst(item, "전화번호"));               // 전화번호
			dto.setDataDate(getFirst(item, "데이터기준일자"));      // 기준일자
			
			dto.setCategoryType(getFirst(item, "시설구분"));                    // 분류/카테고리
			dto.setFacilityName(getFirst(item, "시설명"));                      // 시설명
			dto.setAddress(getFirst(item, "지번주소"));                         // 주소 (지번)
			dto.setArea(getFirst(item, "규격"));                               // 규격 → 면적 필드에 저장
			dto.setNote(getFirst(item, "바닥재"));                              // 바닥재 → 기타 비고 정보
			dto.setManagingAgency(getFirst(item, "관리기관"));                 // 관리기관
			dto.setDataDate(getFirst(item, "데이터기준일", "데이터기준일자"));  // 기준일자
			
			dto.setFacilityName(getFirst(item, "시설명"));                // 시설명
			dto.setRepresentative(getFirst(item, "대표자"));              // 대표자 → 신규 필드
			
			dto.setOperator(getFirst(item, "운영주체"));                  // 운영주체
			dto.setCorporationName(getFirst(item, "법인명"));             // 법인명 → 신규 필드
			dto.setAddress(getFirst(item, "시설소재지"));                 // 주소
			dto.setPhone(getFirst(item, "전화번호"));                     // 전화번호
			dto.setDataDate(getFirst(item, "데이터기준일자"));            // 기준일자
			
			dto.setCategoryType(getFirst(item, "구분"));              // 구분 (카테고리 타입)
			dto.setFacilityName(getFirst(item, "기관명"));            // 기관명
			dto.setAddress(getFirst(item, "주소"));                  // 주소
			dto.setPhone(getFirst(item, "전화번호"));                // 전화번호
			dto.setFaxNumber(getFirst(item, "팩스번호"));            // 팩스번호 → 신규 필드
			dto.setCapacityStatus(getFirst(item, "정원(명)"));       // 정원
			dto.setDataDate(getFirst(item, "데이터기준일자"));        // 기준일자

			dto.setCategory(url); // 요청 URL로부터 유추

			
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
