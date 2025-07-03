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

import static java.util.Map.entry;

@Service
@EnableAsync
@Slf4j
public class BusanFacilityServiceImpl implements BusanFacilityService {

	@Value("${busan.api.key}")
	private String serviceKey;

	private final RestTemplate restTemplate = new RestTemplate();

	private static final Map<String, List<String>> apiUrlMap = Map.ofEntries(
			entry("부산광역시|장애인복지",
					List.of("https://apis.data.go.kr/6260000/BusanDisabledFacService/getDisabledFacilityInfo")),
			entry("부산광역시|아동복지",
					List.of("https://apis.data.go.kr/6260000/ChildWelfareService/ChildWelfareFacilityInfo")),
			entry("부산광역시|노인복지",
					List.of("https://api.odcloud.kr/api/15071152/v1/uddi:7b6bb047-1b65-4419-b152-b226cfd2ba7e")),
			entry("부산광역시|정신보건시설",
					List.of("https://api.odcloud.kr/api/15066738/v1/uddi:a814ee57-4911-4a0f-8f7f-b2da3f742c73")),
			entry("부산광역시|장애인보호", List.of(
					"https://api.odcloud.kr/api/15042650/v1/uddi:f542f98c-d366-44f0-bd66-d85e47b44ada_202001231745")),
			entry("중구|노인복지",
					List.of("https://api.odcloud.kr/api/3072419/v1/uddi:8770624d-3241-4fe7-8797-f7e53e34334d")),
			entry("중구|사회복지", List.of(
					"https://api.odcloud.kr/api/3073914/v1/uddi:5eb596d1-95bf-4c52-868e-ccf5a2c8f53b_202002131636")),
			entry("서구|노인복지",
					List.of("https://api.odcloud.kr/api/15008060/v1/uddi:804761b5-f7ba-4b1d-997c-97b89004b031")),
			entry("서구|사회복지",
					List.of("https://api.odcloud.kr/api/3081345/v1/uddi:d82dbb22-c109-41ff-81fd-cb6580475dd3")),
			entry("서구|공공체육",
					List.of("https://api.odcloud.kr/api/15142930/v1/uddi:f478764a-cd9c-42f9-9bd9-b116d92e5061")),
			entry("동구|노인복지", List.of(
					"https://api.odcloud.kr/api/3080195/v1/uddi:e62a7d98-116a-41c5-b81a-c91f6b59f703_201905281534")),
			entry("동구|장애인복지",
					List.of("https://api.odcloud.kr/api/15023553/v1/uddi:b5078730-dbe4-42a4-bfcd-cec07a24d68d")),
			entry("동구|노인경로당",
					List.of("https://api.odcloud.kr/api/15116371/v1/uddi:ce56713a-b71a-4a5c-aad8-c4eaeae62726")),
			entry("영도구|노인의료복지", List.of(
					"https://api.odcloud.kr/api/15053422/v1/uddi:f5e915e7-4bc0-4e6f-8bfb-f81f50450be5_201905281437")),
			entry("영도구|장애인재활", List.of(
					"https://api.odcloud.kr/api/15054252/v1/uddi:86febcd3-c5c0-45e3-97f2-9d46c9b5cfe0")),
			entry("영도구|청소년지원", List.of(
					"https://api.odcloud.kr/api/3070734/v1/uddi:169442a8-e2bb-47ef-8cb6-dbe619be1fc6")),
			entry("영도구|노인복지", List.of(
					"https://api.odcloud.kr/api/15053423/v1/uddi:8fb1719c-0fc2-4f4a-94a1-88e582b0c6cc_201909191603")),
			entry("영도구|요양시설", List.of(
					"https://api.odcloud.kr/api/15083312/v1/uddi:7cebfdf9-ac9f-4fc9-a72f-a7572137454e_202001131338")),
			entry("영도구|체육시설", List.of(
					"https://api.odcloud.kr/api/15142926/v1/uddi:2abe8751-32ad-4001-a106-823b1b90056e")),
			entry("부산진구|노인복지", List.of(
					"https://api.odcloud.kr/api/15055228/v1/uddi:a5b61da2-9521-481e-8b82-a8bf01d9def3_202003241810")),
			entry("부산진구|아동복지", List.of(
					"https://api.odcloud.kr/api/15037894/v1/uddi:c40157bf-9f82-498f-a6af-a199885715da_201912100920")),
			entry("부산진구|체육시설", List.of(
					"https://api.odcloud.kr/api/15142908/v1/uddi:b7d22c43-0f29-498f-9907-b51599dac6da")),
			entry("동래구|체육시설", List.of(
					"https://api.odcloud.kr/api/3078923/v1/uddi:67bd031b-002e-4839-9835-bfedb47a9f3c")),
			entry("동래구|노인복지", List.of(
					"https://api.odcloud.kr/api/3079126/v1/uddi:f2a64dcb-887e-4d77-8b09-dabbbabc66e3")),
			entry("동래구|아동복지", List.of(
					"https://api.odcloud.kr/api/3079406/v1/uddi:cd4d08f6-a100-4042-aa9d-85e4da532194")),
			entry("동래구|일반복지", List.of(
					"https://api.odcloud.kr/api/15086564/v1/uddi:8f965ba9-e6e6-4c4b-87fd-c954cb6301a9")),
			entry("남구|장애인복지", List.of(
					"https://api.odcloud.kr/api/15055763/v1/uddi:3125ce4b-b68f-4ede-aba6-bb8f03b0720d")),
			entry("남구|아동복지", List.of(
					"https://api.odcloud.kr/api/15047981/v1/uddi:9bd90b5a-34ec-4858-892a-c0799b43161f")),
			entry("남구|요양시설", List.of(
					"https://api.odcloud.kr/api/3081417/v1/uddi:0b9ca887-6d94-4c52-be15-d4b02f4135e2")),
			entry("남구|노인복지", List.of(
					"https://api.odcloud.kr/api/15114872/v1/uddi:810e1c91-904d-4362-b749-f671baf38c00")),
			entry("북구|청소년복지", List.of(
					"https://api.odcloud.kr/api/15026031/v1/uddi:9367e04c-e418-4c86-8005-e25e4d78c691_201909030930")),
			entry("북구|체육시설", List.of(
					"https://api.odcloud.kr/api/3069306/v1/uddi:13f9c53a-3ce6-4ea9-a5e5-ad6a91f47c19_201908271941")),
			entry("북구|노인복지", List.of(
					"https://api.odcloud.kr/api/15026030/v1/uddi:fedda5ce-6973-4353-a0aa-f810e2783bf1_201908270944")),
			entry("북구|장애인복지", List.of(
					"https://api.odcloud.kr/api/15005945/v1/uddi:72039131-801b-4dfd-a41c-a3b471927f0a_201909091152")),
			entry("북구|아동복지", List.of(
					"https://api.odcloud.kr/api/15026029/v1/uddi:1fe2258f-9141-416f-8425-d2b58f22ee83_201908281050")),
			entry("해운대구|체육시설", List.of(
					"https://api.odcloud.kr/api/3075743/v1/uddi:d87c659a-1660-41b1-b739-9b632c9e817f")),
			entry("해운대구|장애인복지", List.of(
					"https://api.odcloud.kr/api/3075573/v1/uddi:3ea888b8-492b-4e61-a550-b097b055a109")),
			entry("수영구|일반복지", List.of(
					"https://api.odcloud.kr/api/15026896/v1/uddi:f2ad84f2-ecc3-4a37-89c5-b7ffb91af84b_201911221138")),
			entry("수영구|체육시설", List.of(
					"https://api.odcloud.kr/api/3076105/v1/uddi:d9a17a83-270a-453a-ab1a-e6faa44a218c_202003171407"))
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
					if (!district.equals(districtFilter))
						continue;

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

				// 2️⃣ 구군이 없는 시 전체 데이터 (ex. 노인요양시설 전체)
				else if (url.contains("8770624d") || url.contains("15071152")) {
					dto.setFacilityName(item.path("시설명").asText(""));
					dto.setAddress(item.path("소재지도로명주소").asText(""));
					dto.setPhone(item.path("전화번호").asText(""));
					dto.setCategory(item.path("시설유형").asText(""));
					dto.setManagingAgency(item.path("관리기관명").asText(""));
					dto.setDataReferenceDate(item.path("데이터기준일자").asText(""));
					dto.setDistrict("부산광역시");
				}

				// 3️⃣ 시군구 + 시설명 기반 복지시설 (ex. 서구 사회복지시설)
				else if (item.has("시군구") && item.has("시설명")) {
					String district = item.path("시군구").asText("");
					if (!district.equals(districtFilter))
						continue;

					dto.setFacilityName(item.path("시설명").asText(""));
					dto.setAddress(item.path("주소").asText(""));
					dto.setPhone(item.path("연락처").asText(""));
					dto.setCategory(item.path("시설종류").asText(""));
					dto.setDistrict(district);
					dto.setOperatorType(item.path("운영주체구분").asText(""));
					dto.setEmployeeCount(item.path("종사자수(명)").asText(""));
					dto.setCapacity(item.path("입소정원수(명)").asText(""));
					dto.setCurrentResidents(item.path("입소인원수(명)").asText(""));
					dto.setChildResidents(item.path("입소아동수(명)").asText(""));
					
				} else if (item.has("시설명") && item.has("시설장")) {
					dto.setFacilityName(item.path("시설명").asText(""));
					dto.setAddress(item.path("소재지").asText(""));
					dto.setPhone(item.path("전화번호").asText(""));
					dto.setFax(item.path("팩스번호").asText(""));
					dto.setCategory(item.path("규모").asText("")); // 규모를 카테고리에 임시 저장해도 됨

					dto.setOperator(item.path("운영주체").asText(""));
					dto.setDirector(item.path("시설장").asText(""));
					dto.setCapacity(item.path("정원").asText(""));
					dto.setCurrentUsers(item.path("이용현원").asText(""));
					dto.setStaffCount(item.path("직원수").asText(""));
					dto.setInstallDate(item.path("설치일").asText(""));

					dto.setDistrict(districtFilter); // 수동으로 설정
				}
				else if (item.has("공공_민간") && item.has("운영방법")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));

				    dto.setFacilityType(item.path("시설종류").asText(""));
				    dto.setPublicOrPrivate(item.path("공공_민간").asText(""));
				    dto.setOperationMethod(item.path("운영방법").asText(""));
				    dto.setOperator(item.path("운영주체").asText(""));
				    dto.setLeaderName(item.path("단체장명").asText(""));
				    dto.setRepresentative(item.path("운영대표자").asText(""));
				    dto.setArea(item.path("연면적(제곱미터)").asText(""));

				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("기관명") && item.has("프로그램명")) {
				    dto.setInstitutionName(item.path("기관명").asText(""));
				    dto.setProjectName(item.path("사업명").asText(""));
				    dto.setProgramName(item.path("프로그램명").asText(""));
				    dto.setContent(item.path("프로그램 내용").asText(""));
				    dto.setTarget(item.path("대상").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setFee(item.path("이용료").asText(""));
				    dto.setNote(item.path("비고").asText(""));
				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("기관명") && item.has("기관주소")) {
				    dto.setFacilityName(item.path("기관명").asText(""));
				    dto.setCategory(item.path("급여종류").asText(""));
				    dto.setRepresentative(item.path("대표자명").asText(""));
				    dto.setAddress(item.path("기관주소").asText(""));
				    dto.setPhone(item.path("기관전화번호").asText(""));
				    dto.setDistrict(districtFilter); // or "부산광역시" 등으로 고정
				}
				else if (item.has("시설명") && item.has("도로명주소")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("도로명주소").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setDistrict(districtFilter);
				}
				else if (item.has("시설명") && item.has("주 소")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setCategory(item.path("종류").asText(""));
				    dto.setArea(item.path("연면적(제곱미터)").asText(""));
				    dto.setAddress(item.path("주 소").asText(""));
				    dto.setCurrentUsers(item.path("1일 평균이용인원").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setDataReferenceDate(item.path("기준일").asText(""));
				    dto.setDistrict(districtFilter); // 또는 "부산진구"로 고정 가능
				}
				else if (item.has("시설명") && item.has("소재지") && item.has("정원(명)")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setCapacity(item.path("정원(명)").asText(""));
				    dto.setCurrentUsers(item.path("현원(명)").asText(""));
				    dto.setDistrict(districtFilter); // 수동 세팅
				}
				else if (item.has("시설명") && item.has("주소(위치)") && item.has("설치년도")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("주소(위치)").asText(""));
				    dto.setInstallDate(item.path("설치년도").asText(""));
				    dto.setArea(item.path("면적(제곱미터)").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setDataReferenceDate(item.path("데이터기준일자").asText(""));
				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("체육시설명") && item.has("위치") && item.has("유형")) {
				    dto.setFacilityName(item.path("체육시설명").asText(""));
				    dto.setAddress(item.path("위치").asText(""));
				    dto.setInstallDate(item.path("설치년도").asText(""));
				    dto.setArea(item.path("면적(제곱미터)").asText(""));
				    dto.setCategory(item.path("유형").asText("")); // 유형을 카테고리로 저장

				    dto.setAdditionalInfo("간이운동장: " + item.path("간이운동장").asText("")
				        + ", 체력단련시설: " + item.path("체력단련시설").asText("")
				        + ", 부대편의시설: " + item.path("부대편의시설").asText("")); // dto에 설명용 필드가 있다면 활용

				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("시설명") && item.has("소재지") && item.has("구분")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setCategory(item.path("구분").asText(""));
				    dto.setCapacity(item.path("정원").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setDistrict(districtFilter); // 수동 지정
				}
				else if (item.has("시설명") && item.has("시설유형") && item.has("시설종류")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setCategory(item.path("시설유형").asText(""));
				    dto.setFacilityType(item.path("시설종류").asText(""));

				    dto.setCapacity(item.path("입소정원수").asText(""));
				    dto.setCurrentResidents(item.path("입소인원수").asText(""));
				    dto.setChildResidents(item.path("입소아동수").asText(""));
				    dto.setEmployeeCount(item.path("종사자수").asText(""));

				    dto.setAddress(item.path("시설주소(도로명)").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setDistrict(item.path("시군구").asText(""));
				}
				else if (item.has("복지관명") && item.has("도로명주소")) {
				    dto.setFacilityName(item.path("복지관명").asText(""));
				    dto.setAddress(item.path("도로명주소").asText(""));
				    dto.setPhone(item.path("연락처").asText(""));
				    dto.setDirector(item.path("시설장").asText(""));
				    dto.setOperator(item.path("위탁법인").asText(""));
				    dto.setInstallDate(item.path("개관일").asText(""));
				    dto.setArea(item.path("연면적(제곱미터)").asText(""));
				    dto.setStaffCount(item.path("직원수(명)").asText(""));
				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("시 설 명") && item.has("소재지")) {
				    dto.setFacilityName(item.path("시 설 명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setInstallDate(item.path("설치신고일").asText(""));
				    dto.setCurrentUsers(item.path("이용자수").asText(""));
				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("시설명") && item.has("소 재 지")) {
				    dto.setCategory(item.path("시설구분").asText(""));
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소 재 지").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setCapacity(item.path("입소정원").asText(""));
				    dto.setDistrict(districtFilter); // 또는 "부산광역시"로 고정 가능
				}
				else if (item.has("기관명") && item.has("기관주소")) {
				    dto.setFacilityName(item.path("기관명").asText(""));

				    // 기관종류 + 급여종류 조합 (예: 장애인시설 (단기보호))
				    String 기관종류 = item.path("기관종류").asText("");
				    String 급여종류 = item.path("급여종류").asText("");

				    if (!기관종류.isEmpty() && !급여종류.isEmpty()) {
				        dto.setCategory(기관종류 + " (" + 급여종류 + ")");
				    } else if (!기관종류.isEmpty()) {
				        dto.setCategory(기관종류);
				    } else {
				        dto.setCategory(급여종류); // 둘 다 없을 수는 없음
				    }

				    dto.setAddress(item.path("기관주소").asText(""));
				    dto.setPhone(item.path("기관전화번호").asText(""));

				    dto.setDistrict(districtFilter); // 예: "중구", "부산광역시"
				}
				else if (item.has("시설유형") && item.has("시설명")) {
				    dto.setCategory(item.path("시설유형").asText(""));
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setAddress(item.path("시설소재지 주소").asText(""));
				    dto.setRepresentative(item.path("대표자명").asText(""));
				    
				    dto.setDistrict(districtFilter); // 예: 영도구, 서구 등
				}
				else if (item.has("시설명") && item.has("운영주체")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setOperator(item.path("운영주체").asText(""));
				    dto.setArea(item.path("시설규모(제곱미터)").asText(""));
				    dto.setPhone(item.path("전화").asText(""));
				    dto.setNote(item.path("비고").asText(""));

				    dto.setDistrict(districtFilter); // 예: 남구, 동래구 등
				}
				else if (item.has("상호") && item.has("시설주소(도로명)")) {
				    dto.setCategory(item.path("업종").asText(""));
				    dto.setFacilityName(item.path("상호").asText(""));
				    dto.setAddress(item.path("시설주소(도로명)").asText(""));
				    dto.setPhone(item.path("시설전화번호").asText(""));
				    dto.setPublicOrPrivate(item.path("공영민영구분").asText(""));

				    dto.setDistrict(districtFilter); // 수동 설정
				}
				else if (item.has("시설명") && item.has("시설장")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setCategory(item.path("시설종류").asText(""));
				    dto.setDirector(item.path("시설장").asText(""));
				    dto.setAddress(item.path("주소").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setCapacity(item.path("정원수(명)").asText(""));
				    dto.setCurrentUsers(item.path("이용수(명)").asText(""));
				    dto.setDistrict(districtFilter); // or 시군구 고정
				}
				else if (item.has("시설명") && item.has("시설장")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("주소").asText(""));
				    dto.setDirector(item.path("시설장").asText(""));
				    dto.setCurrentUsers(item.path("생활(이용)인원").asText(""));
				    dto.setInstallDate(item.path("운영시작일자").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setCategory(item.path("구분").asText("")); // 옵션
				    dto.setDistrict(districtFilter); // 고정값
				}
				else if (item.has("시설명") && item.has("시설장") && item.has("구군명")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setDirector(item.path("시설장").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setInstallDate(item.path("설치일자").asText(""));
				    dto.setCapacity(item.path("정원").asText(""));
				    dto.setCurrentUsers(item.path("현원").asText(""));
				    dto.setStaffCount(item.path("종사자").asText(""));
				    dto.setCategory(item.path("시설종류").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setDistrict(item.path("구군명").asText(""));
				    dto.setDataReferenceDate(item.path("데이터기준일자").asText(""));
				}
				else if (item.has("시설명") && item.has("위탁기간")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setArea(item.path("시설규모").asText(""));
				    dto.setOperator(item.path("관리운영").asText("")); // 운영기관
				    dto.setNote("주요시설: " + item.path("주요 시설").asText("") +
				                ", 위탁기간: " + item.path("위탁기간").asText(""));
				    dto.setDistrict(districtFilter);
				}
				else if (item.has("구군명") && item.has("시설유형")) {
				    dto.setDistrict(item.path("구군명").asText(""));
				    dto.setCategory(item.path("시설유형").asText(""));
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("도로명주소").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setCapacity(item.path("정원").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setDataReferenceDate(item.path("데이터기준일자").asText(""));
				}
				else if (item.has("시설유형") && item.has("시설장")) {
				    dto.setCategory(item.path("시설유형").asText(""));
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("소재지").asText(""));
				    dto.setPhone(item.path("전화번호").asText(""));
				    dto.setDirector(item.path("시설장").asText(""));
				    dto.setDistrict(districtFilter); // 또는 수동 지정
				}
				else if (item.has("간이운동시설") && item.has("체력시설")) {
				    dto.setFacilityName(item.path("시설명").asText(""));
				    dto.setAddress(item.path("위치").asText(""));
				    dto.setArea(item.path("면적(제곱미터)").asText(""));
				    dto.setLatitude(parseDouble(item.path("위도").asText("")));
				    dto.setLongitude(parseDouble(item.path("경도").asText("")));
				    dto.setNote("체력시설: " + item.path("체력시설").asText("") +
				                ", 부대편의시설: " + item.path("부대편의시설").asText("") +
				                ", 간이운동시설: " + item.path("간이운동시설").asText(""));
				    dto.setInstallDate(item.path("설치년도").asText(""));
				    dto.setDistrict(districtFilter);
				}
				else {
				    log.warn("🛑 미처리된 데이터 구조 발견: {}", item.toPrettyString());
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