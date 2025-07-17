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
            List.of("https://api.odcloud.kr/api/15011892/v1/uddi:7624e013-b8e9-49af-8976-b2449672f51d")),
			entry("미추홀구|행정복지",
					List.of("https://api.odcloud.kr/api/15081949/v1/uddi:c5c91d21-1434-44c9-bc89-98cec45cddb2")),
			entry("미추홀구|한부모복지",
					List.of("https://api.odcloud.kr/api/15126350/v1/uddi:eb9c2fe7-4fd6-4658-ab97-8129efa57d8d")),
			entry("연수구|노인복지",
					List.of("https://api.odcloud.kr/api/15133496/v1/uddi:d5495d77-f4b2-4912-893e-d9a340ad6709")),
			entry("연수구|장애인복지",
					List.of("https://api.odcloud.kr/api/15085414/v1/uddi:32a02b56-c08b-4558-aafa-b0ea330224b6")),
			entry("연수구|노인경로",
					List.of("https://api.odcloud.kr/api/15064884/v1/uddi:1b660daa-c2e6-41e8-9f82-96df3956bb50")),
			entry("연수구|청소년복지",
					List.of("https://api.odcloud.kr/api/15039268/v1/uddi:80df59c5-4b71-4491-a62a-b022a47ed25a")),
			entry("남동구|체육시설",
					List.of("https://api.odcloud.kr/api/3077722/v1/uddi:8100cb0c-e486-419e-96a2-c39a72eca629")),
			entry("남동구|장애인복지",
					List.of("https://api.odcloud.kr/api/15067702/v1/uddi:b2c03e06-b507-40f6-9db8-c30e7e006410")),
			entry("남동구|청소년이용",
					List.of("https://api.odcloud.kr/api/3043976/v1/uddi:c1c9ac92-b92e-405c-9f9f-c4b22521b134")),
			entry("남동구|노인경로당",
					List.of("https://api.odcloud.kr/api/3077664/v1/uddi:7c8f6cbc-0efd-4f50-889f-f10090d5d76e")),
			entry("남동구|지역아동",
					List.of("https://api.odcloud.kr/api/3077601/v1/uddi:9f4884cd-932b-411d-b713-d129f5ced445")),
			entry("남동구|사회복지",
					List.of("https://api.odcloud.kr/api/15113039/v1/uddi:de76ae07-a685-4c8c-9009-e4577c57c9e4")),
			entry("남동구|행정복지",
					List.of("https://api.odcloud.kr/api/15104014/v1/uddi:9c01ddfd-0f7c-47e3-a49d-a0f5ba14a33d")),
			entry("남동구|여성복지",
					List.of("https://api.odcloud.kr/api/15113040/v1/uddi:73c8311a-bdf7-4163-aa4e-b6af04080b41")),
			entry("남동구|방문요양",
					List.of("https://api.odcloud.kr/api/15087604/v1/uddi:af03bf91-5c56-4b55-968a-dec99ef9c3fb")),
			entry("남동구|청소년복지",
					List.of("https://api.odcloud.kr/api/15113041/v1/uddi:e83e393a-be36-441b-87cb-9e70f13653a1")),
			entry("남동구|한부모복지",
					List.of("https://api.odcloud.kr/api/15119085/v1/uddi:b9ec4a6d-195e-4131-a280-f4380f19c3c7")),
			entry("남동구|노인요양",
					List.of("https://api.odcloud.kr/api/15113037/v1/uddi:5b0474ec-d73f-4214-b708-fb170d944445")),
			entry("남동구|노인복지",
					List.of("https://api.odcloud.kr/api/15133754/v1/uddi:66885f3f-772f-4662-a96b-f6192279d584")),
			entry("부평구|노인복지",
					List.of("https://api.odcloud.kr/api/3078614/v1/uddi:b1262eaf-14e9-4cb2-bc6d-b2a11ea4bf21")),
			entry("부평구|장애인복지",
					List.of("https://api.odcloud.kr/api/3044744/v1/uddi:ac2affe2-0d1d-40df-a6c9-d869e5cb9492")),
			entry("부평구|아동복지",
					List.of("https://api.odcloud.kr/api/3078616/v1/uddi:868a6fe2-9816-4935-bbe9-e43679b51d12")),
			entry("부평구|장애인재활",
					List.of("https://api.odcloud.kr/api/15104154/v1/uddi:721c6ac2-fe90-4993-824f-d45c5f26412e")),
			entry("부평구|장애인편의",
					List.of("https://api.odcloud.kr/api/15104162/v1/uddi:466b0ac3-8ecd-467b-8ed2-febd15502f92")),
			entry("계양구|노인복지",
					List.of("https://api.odcloud.kr/api/15053541/v1/uddi:eea64658-3d29-4eca-aae2-b7ca76cc826d_201908231453")),
			entry("계양구|장애인복지",
					List.of("https://api.odcloud.kr/api/15053540/v1/uddi:1ab7b464-dbda-48d6-962f-d64fee016053_201811051325")),
			entry("계양구|노인의료복지",
					List.of("https://api.odcloud.kr/api/15100621/v1/uddi:f0c8a0e6-bf32-4f3f-8b6a-c060e26e4d1c")),
			entry("계양구|재가노인복지",
					List.of("https://api.odcloud.kr/api/15100632/v1/uddi:712b0cab-eaaa-45d1-8a12-8277c256ec63")),
			entry("계양구|여성복지",
					List.of("https://api.odcloud.kr/api/15100624/v1/uddi:97e77691-42cf-4582-8b39-e235bf222ebd")),
			entry("계양구|노인여가복지",
					List.of("https://api.odcloud.kr/api/15100620/v1/uddi:5c5b5955-b4ff-4120-85ae-f0fe5ce7f1f4")),
			entry("계양구|장애인재활",
					List.of("https://api.odcloud.kr/api/15100626/v1/uddi:d62e089e-b055-4b8f-9d22-eebd2b421db5")),
			entry("계양구|청소년시설",
					List.of("https://api.odcloud.kr/api/15117135/v1/uddi:8531b4b1-bf14-4d00-8bc9-ea4352fc2f91")),
			entry("서구|노인복지",
					List.of("https://api.odcloud.kr/api/15055116/v1/uddi:1e36c8e4-2c74-4641-922c-909503b560e6")),
			entry("서구|장애인복지",
					List.of("https://api.odcloud.kr/api/3078097/v1/uddi:e27a0304-c896-48ef-9454-f6609d4f08cf")),
			entry("서구|여성복지",
					List.of("https://api.odcloud.kr/api/15063137/v1/uddi:4415613e-f190-4387-b50c-ae22d7f94d6f")),
			entry("서구|요양원",
					List.of("https://api.odcloud.kr/api/15040126/v1/uddi:a5022b97-7d3e-45ce-9c58-b68109130315"))
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

			// 공통 기본 정보
			dto.setFacilityName(getFirst(item, "시설명", "명칭", "기관명", "경로당명", "지역아동센터명"));  // 다양한 명칭 병합
			dto.setFacilityType(getFirst(item, "시설종류", "시설유형", "시설구분"));     // 유형
			dto.setCategory(getFirst(item, "종류", "구분", "카테고리", "CATEGORY", "1차분류", "2차분류", "3차분류", "유형", "분류", "입소대상", "설립구분")); // 분류
			dto.setOperator(getFirst(item, "운영주체", "운영주체(법인명)", "법인", "법인명(재단명)"));  // 운영자
			dto.setDirector(getFirst(item, "시설장"));                                    // 책임자
			dto.setNote(getFirst(item, "운영내용", "비고", "특이사항", "사업내용", "설립목적", "입소기간", "입소절차", "기타")); // 설명

			// 주소
			dto.setAddress(getFirst(item, "주소", "도로명주소", "도로명 주소", "지번주소", "소재지", "주 소", "체육시설 소재지", "위치", "소 재 지")); // 주소 병합
			dto.setDistrict(getFirst(item, "동명", "관할동", "행정동", "동구분")); // 행정동 정보

			// 연락처
			dto.setPhone(getFirst(item, "전화번호", "연락처"));
			dto.setFax(getFirst(item, "팩스"));

			// 좌표
			dto.setLatitude(parseDouble(item, "위도"));
			dto.setLongitude(parseDouble(item, "경도"));

			// 수용 및 이용 정보
			dto.setCapacity(getFirst(item, "정원", "정원(명)", "입소정원", "시설정원", "이용자수(정원)"));
			dto.setCurrentResidents(getFirst(item, "수용인원", "시설현원", "이용자수(현원)"));
			dto.setCurrentUsers(getFirst(item, "계"));
			dto.setMaleCount(getFirst(item, "남"));
			dto.setFemaleCount(getFirst(item, "여"));

			// 설립일 / 지정일
			dto.setEstablishDate(getFirst(item, "설립일자", "건축허가일", "지정일자", "설치연월", "설립연도", "설립일", "인가일"));

			// 시설 규모 및 인력 정보
			dto.setScale(getFirst(item, "시설규모(제곱미터)", "건축물규모", "면적", "시설규모", "대지규모(제곱미터)", "건물규모(제곱미터)", "대지규모(미터제곱)", "건물규모(미터제곱)"));
			dto.setStaffCount(getFirst(item, "종사자수", "종사자", "종사자수(정원)", "종사자수(현원)"));
			dto.setDayStaff(getFirst(item, "주간인력"));
			dto.setNightStaff(getFirst(item, "야간인력"));
			dto.setElderlyCount(getFirst(item, "노인수"));

			// 안전 관련
			dto.setCompositeBuilding(getFirst(item, "복합건물여부"));
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

			// 데이터 기준일
			dto.setDataDate(getFirst(item, "데이터 기준일", "데이터기준일", "데이터기준일자", "데이터 기준 일자"));
			
			dto.setFacilityType(getFirst(item, "시설유형"));
			dto.setFacilityName(getFirst(item, "시설명"));
			dto.setCurrentResidents(getFirst(item, "생활인수(명)"));
			dto.setAddress(getFirst(item, "시설소재지"));
			dto.setPhone(getFirst(item, "전화번호"));
			dto.setFax(getFirst(item, "FAX번호"));
			dto.setDistrict(getFirst(item, "행정동"));
			dto.setNote(getFirst(item, "비고"));
			
			dto.setFacilityName(getFirst(item, "시설_단체명"));
			dto.setDistrict(getFirst(item, "행정동"));
			dto.setAddress(getFirst(item, "주소"));
			dto.setPhone(getFirst(item, "연락처"));

			dto.setFacilityName(getFirst(item, "시설명"));
			dto.setAddress(getFirst(item, "도로명주소"));
			dto.setPhone(getFirst(item, "전화번호"));
			dto.setDistrict(getFirst(item, "행정동"));
	
			dto.setFacilityName(getFirst(item, "시설명"));
			dto.setAddress(getFirst(item, "위치")); // 주소로 사용
			dto.setPhone(getFirst(item, "연락처"));
			dto.setDistrict(getFirst(item, "행정동"));
			dto.setDataDate(getFirst(item, "데이터기준일"));
			dto.setHomepage(getFirst(item, "홈페이지주소")); // 필요 시 DTO에 필드 추가
			
			dto.setFacilityName(getFirst(item, "시설명"));
			dto.setFacilityType(getFirst(item, "시설종류", "시설유형"));
			dto.setAddress(getFirst(item, "소재지"));
			dto.setLatitude(parseDouble(item, "위도"));
			dto.setLongitude(parseDouble(item, "경도"));
			dto.setCapacity(getFirst(item, "입소정원"));
			dto.setOperator(getFirst(item, "시설운영"));
			dto.setEstablishDate(getFirst(item, "설치일자"));
			dto.setPhone(getFirst(item, "전화번호"));
			dto.setDataDate(getFirst(item, "데이터기준일자"));
			
			dto.setFacilityName(getFirst(item, "시설명"));
			dto.setFacilityType(getFirst(item, "시설유형"));
			dto.setAddress(getFirst(item, "소재지"));
			dto.setCapacity(getFirst(item, "정원"));
			dto.setCurrentResidents(getFirst(item, "입소인원"));
			dto.setStaffCount(getFirst(item, "직원현원"));
			dto.setEstablishDate(getFirst(item, "설치 승인일"));
			dto.setOperator(getFirst(item, "법인명"));
			dto.setDirector(getFirst(item, "시설장"));
			dto.setPhone(getFirst(item, "전화번호"));
			dto.setFax(getFirst(item, "팩스번호"));
			dto.setDataDate(getFirst(item, "데이터기준일자"));
			
			dto.setFacilityName(getFirst(item, "시설명"));
			dto.setAddress(getFirst(item, "소재지"));
			dto.setPhone(getFirst(item, "전화번호"));
			dto.setFax(getFirst(item, "팩스번호"));
			
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
