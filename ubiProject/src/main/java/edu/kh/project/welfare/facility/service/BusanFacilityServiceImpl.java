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

import edu.kh.project.welfare.facility.dto.BusanFacility;
import lombok.extern.slf4j.Slf4j;

@Service
@EnableAsync
@Slf4j
public class BusanFacilityServiceImpl implements BusanFacilityService {

	@Value("${busan.api.key}")
	private String serviceKey;

	private final RestTemplate restTemplate = new RestTemplate();

	@Lazy
	@Autowired
	private BusanFacilityService selfProxy;
	
	private static final Map<String, List<String>> apiUrlMap = Map.ofEntries(
			
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
			entry("영도구|장애인재활",
					List.of("https://api.odcloud.kr/api/15054252/v1/uddi:86febcd3-c5c0-45e3-97f2-9d46c9b5cfe0")),
			entry("영도구|청소년지원",
					List.of("https://api.odcloud.kr/api/3070734/v1/uddi:169442a8-e2bb-47ef-8cb6-dbe619be1fc6")),
			entry("영도구|노인복지", List.of(
					"https://api.odcloud.kr/api/15053423/v1/uddi:8fb1719c-0fc2-4f4a-94a1-88e582b0c6cc_201909191603")),
			entry("영도구|요양시설", List.of(
					"https://api.odcloud.kr/api/15083312/v1/uddi:7cebfdf9-ac9f-4fc9-a72f-a7572137454e_202001131338")),
			entry("영도구|체육시설",
					List.of("https://api.odcloud.kr/api/15142926/v1/uddi:2abe8751-32ad-4001-a106-823b1b90056e")),
			entry("부산진구|노인복지", List.of(
					"https://api.odcloud.kr/api/15055228/v1/uddi:a5b61da2-9521-481e-8b82-a8bf01d9def3_202003241810")),
			entry("부산진구|아동복지", List.of(
					"https://api.odcloud.kr/api/15037894/v1/uddi:c40157bf-9f82-498f-a6af-a199885715da_201912100920")),
			entry("부산진구|체육시설",
					List.of("https://api.odcloud.kr/api/15142908/v1/uddi:b7d22c43-0f29-498f-9907-b51599dac6da")),
			entry("동래구|체육시설",
					List.of("https://api.odcloud.kr/api/3078923/v1/uddi:67bd031b-002e-4839-9835-bfedb47a9f3c")),
			entry("동래구|노인복지",
					List.of("https://api.odcloud.kr/api/3079126/v1/uddi:f2a64dcb-887e-4d77-8b09-dabbbabc66e3")),
			entry("동래구|아동복지",
					List.of("https://api.odcloud.kr/api/3079406/v1/uddi:cd4d08f6-a100-4042-aa9d-85e4da532194")),
			entry("동래구|일반복지",
					List.of("https://api.odcloud.kr/api/15086564/v1/uddi:8f965ba9-e6e6-4c4b-87fd-c954cb6301a9")),
			entry("남구|장애인복지",
					List.of("https://api.odcloud.kr/api/15055763/v1/uddi:3125ce4b-b68f-4ede-aba6-bb8f03b0720d")),
			entry("남구|아동복지",
					List.of("https://api.odcloud.kr/api/15047981/v1/uddi:9bd90b5a-34ec-4858-892a-c0799b43161f")),
			entry("남구|요양시설",
					List.of("https://api.odcloud.kr/api/3081417/v1/uddi:0b9ca887-6d94-4c52-be15-d4b02f4135e2")),
			entry("남구|노인복지",
					List.of("https://api.odcloud.kr/api/15114872/v1/uddi:810e1c91-904d-4362-b749-f671baf38c00")),
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
			entry("해운대구|체육시설",
					List.of("https://api.odcloud.kr/api/3075743/v1/uddi:d87c659a-1660-41b1-b739-9b632c9e817f")),
			entry("해운대구|장애인복지",
					List.of("https://api.odcloud.kr/api/3075573/v1/uddi:3ea888b8-492b-4e61-a550-b097b055a109")),
			entry("수영구|일반복지", List.of(
					"https://api.odcloud.kr/api/15026896/v1/uddi:f2ad84f2-ecc3-4a37-89c5-b7ffb91af84b_201911221138")),
			entry("수영구|체육시설", List.of(
					"https://api.odcloud.kr/api/3076105/v1/uddi:d9a17a83-270a-453a-ab1a-e6faa44a218c_202003171407")),
			entry("수영구|노인복지",
					List.of("https://api.odcloud.kr/api/3043304/v1/uddi:45f95088-42b8-456b-ace1-c483e23435a2")),
			entry("수영구|장애인복지",
					List.of("https://api.odcloud.kr/api/15051482/v1/uddi:e12e8812-6463-4dc8-9623-9726dd497094")),
			entry("수영구|아동복지", List.of(
					"https://api.odcloud.kr/api/3043358/v1/uddi:ed3c7840-9845-4ce8-97da-b60b6c0ba4d8_202003251551")),
			entry("수영구|아동복지2",
					List.of("https://api.odcloud.kr/api/15142544/v1/uddi:005447b7-6511-4f9e-8be5-e49ff67dd00e")),
			entry("금정구|노인복지",
					List.of("https://api.odcloud.kr/api/3073019/v1/uddi:beb9e4f4-368b-41f0-a17e-dcf1b4a692a8")),
			entry("금정구|장애인복지", List.of(
					"https://api.odcloud.kr/api/3073115/v1/uddi:879568b7-8459-4987-8af9-d57fd1b533e8_202002191107")),
			entry("금정구|아동복지",
					List.of("https://api.odcloud.kr/api/15035137/v1/uddi:0e73f320-9208-4116-aa99-d75f387d2263")),
			entry("금정구|노인복지2",
					List.of("https://api.odcloud.kr/api/15139571/v1/uddi:bb8b2986-d417-4bba-84c2-861143ae2a05")),
			entry("강서구|체육시설", List.of(
					"https://api.odcloud.kr/api/15025042/v1/uddi:7987613e-3c78-4ff8-a1aa-b1928f70db25_201909041554")),
			entry("강서구|장애인복지", List.of(
					"https://api.odcloud.kr/api/15023012/v1/uddi:91c3c9ca-cbc4-42c4-ba13-e837b96ac63f_201909041525")),
			entry("강서구|노인복지", List.of(
					"https://api.odcloud.kr/api/3045888/v1/uddi:ccf66c7a-29c3-4a02-ae6b-93224421cdf8_201905031004")),
			entry("사하구|장애인복지", List.of(
					"https://api.odcloud.kr/api/15016059/v1/uddi:c7d2ce9c-0984-44b2-956a-af41ba8ce01d_202003231514")),
			entry("사하구|일반복지", List.of(
					"https://api.odcloud.kr/api/3045773/v1/uddi:f9cad01a-fd93-4365-ad3e-994b12906428_202001201037")),
			entry("사하구|노인복지", List.of(
					"https://api.odcloud.kr/api/15016060/v1/uddi:2f68f282-d9c7-4e64-956e-c4ded837b1df_201905301330")),
			entry("사상구|노인복지", List.of(
					"https://api.odcloud.kr/api/15055219/v1/uddi:1f4793e7-9cc6-4e72-8e64-fbb4dbcdf502_202003052041")),
			entry("사상구|장애인복지",
					List.of("https://api.odcloud.kr/api/15007309/v1/uddi:e0c7399b-996d-4903-bdc5-ab867fc49e6d")),
			entry("사상구|노인복지2",
					List.of("https://api.odcloud.kr/api/15055218/v1/uddi:7020473f-5e80-4ef2-8444-802f78373d53")),
			entry("연제구|노인복지",
					List.of("https://api.odcloud.kr/api/15051406/v1/uddi:a0bb6018-2834-4462-ab42-e1f00d903550")),
			entry("연제구|장애인복지", List.of(
					"https://api.odcloud.kr/api/3082195/v1/uddi:d4710abc-e17d-469c-93ba-e709845cf9da_201906191319")),
			entry("기장군|체육시설",
					List.of("https://api.odcloud.kr/api/15030106/v1/uddi:6ff6a15b-7b5e-4989-8533-dd5734e759ed")),
			entry("기장군|노인복지",
					List.of("https://api.odcloud.kr/api/15004397/v1/uddi:0ceb8ea2-9ee0-47da-aa1f-c8859b5cd2c3")),
			entry("기장군|장애인복지", List.of(
					"https://api.odcloud.kr/api/15047997/v1/uddi:c49c64ff-878c-4d26-a7d8-a4ad27365594_202002040926")),
			entry("중구|전체", List.of("https://api.odcloud.kr/api/3072419/v1/uddi:8770624d-3241-4fe7-8797-f7e53e34334d",
					"https://api.odcloud.kr/api/3073914/v1/uddi:5eb596d1-95bf-4c52-868e-ccf5a2c8f53b_202002131636")),
			entry("서구|전체",
					List.of("https://api.odcloud.kr/api/15008060/v1/uddi:804761b5-f7ba-4b1d-997c-97b89004b031",
							"https://api.odcloud.kr/api/3081345/v1/uddi:d82dbb22-c109-41ff-81fd-cb6580475dd3",
							"https://api.odcloud.kr/api/15142930/v1/uddi:f478764a-cd9c-42f9-9bd9-b116d92e5061")),
			entry("동구|전체", List.of(
					"https://api.odcloud.kr/api/3080195/v1/uddi:e62a7d98-116a-41c5-b81a-c91f6b59f703_201905281534",
					"https://api.odcloud.kr/api/15023553/v1/uddi:b5078730-dbe4-42a4-bfcd-cec07a24d68d",
					"https://api.odcloud.kr/api/15116371/v1/uddi:ce56713a-b71a-4a5c-aad8-c4eaeae62726")),
			entry("영도구|전체", List.of(
					"https://api.odcloud.kr/api/15053422/v1/uddi:f5e915e7-4bc0-4e6f-8bfb-f81f50450be5_201905281437",
					"https://api.odcloud.kr/api/15054252/v1/uddi:86febcd3-c5c0-45e3-97f2-9d46c9b5cfe0",
					"https://api.odcloud.kr/api/3070734/v1/uddi:169442a8-e2bb-47ef-8cb6-dbe619be1fc6",
					"https://api.odcloud.kr/api/15083312/v1/uddi:7cebfdf9-ac9f-4fc9-a72f-a7572137454e_202001131338",
					"https://api.odcloud.kr/api/15053423/v1/uddi:8fb1719c-0fc2-4f4a-94a1-88e582b0c6cc_201909191603",
					"https://api.odcloud.kr/api/15142926/v1/uddi:2abe8751-32ad-4001-a106-823b1b90056e")),
			entry("부산진구|전체", List.of(
					"https://api.odcloud.kr/api/15055228/v1/uddi:a5b61da2-9521-481e-8b82-a8bf01d9def3_202003241810",
					"https://api.odcloud.kr/api/15037894/v1/uddi:c40157bf-9f82-498f-a6af-a199885715da_201912100920",
					"https://api.odcloud.kr/api/15142908/v1/uddi:b7d22c43-0f29-498f-9907-b51599dac6da")),
			entry("동래구|전체",
					List.of("https://api.odcloud.kr/api/3078923/v1/uddi:67bd031b-002e-4839-9835-bfedb47a9f3c",
							"https://api.odcloud.kr/api/3079126/v1/uddi:f2a64dcb-887e-4d77-8b09-dabbbabc66e3",
							"https://api.odcloud.kr/api/3079406/v1/uddi:cd4d08f6-a100-4042-aa9d-85e4da532194",
							"https://api.odcloud.kr/api/15086564/v1/uddi:8f965ba9-e6e6-4c4b-87fd-c954cb6301a9")),
			entry("남구|전체",
					List.of("https://api.odcloud.kr/api/15055763/v1/uddi:3125ce4b-b68f-4ede-aba6-bb8f03b0720d",
							"https://api.odcloud.kr/api/15047981/v1/uddi:9bd90b5a-34ec-4858-892a-c0799b43161f",
							"https://api.odcloud.kr/api/3081417/v1/uddi:0b9ca887-6d94-4c52-be15-d4b02f4135e2",
							"https://api.odcloud.kr/api/15114872/v1/uddi:810e1c91-904d-4362-b749-f671baf38c00")),
			entry("북구|전체", List.of(
					"https://api.odcloud.kr/api/15026031/v1/uddi:9367e04c-e418-4c86-8005-e25e4d78c691_201909030930",
					"https://api.odcloud.kr/api/3069306/v1/uddi:13f9c53a-3ce6-4ea9-a5e5-ad6a91f47c19_201908271941",
					"https://api.odcloud.kr/api/15026030/v1/uddi:fedda5ce-6973-4353-a0aa-f810e2783bf1_201908270944",
					"https://api.odcloud.kr/api/15005945/v1/uddi:72039131-801b-4dfd-a41c-a3b471927f0a_201909091152",
					"https://api.odcloud.kr/api/15026029/v1/uddi:1fe2258f-9141-416f-8425-d2b58f22ee83_201908281050")),
			entry("해운대구|전체",
					List.of("https://api.odcloud.kr/api/3075743/v1/uddi:d87c659a-1660-41b1-b739-9b632c9e817f",
							"https://api.odcloud.kr/api/3075573/v1/uddi:3ea888b8-492b-4e61-a550-b097b055a109")),
			entry("수영구|전체", List.of(
					"https://api.odcloud.kr/api/15026896/v1/uddi:f2ad84f2-ecc3-4a37-89c5-b7ffb91af84b_201911221138",
					"https://api.odcloud.kr/api/3076105/v1/uddi:d9a17a83-270a-453a-ab1a-e6faa44a218c_202003171407",
					"https://api.odcloud.kr/api/3043304/v1/uddi:45f95088-42b8-456b-ace1-c483e23435a2",
					"https://api.odcloud.kr/api/15051482/v1/uddi:e12e8812-6463-4dc8-9623-9726dd497094",
					"https://api.odcloud.kr/api/3043358/v1/uddi:ed3c7840-9845-4ce8-97da-b60b6c0ba4d8_202003251551",
					"https://api.odcloud.kr/api/15142544/v1/uddi:005447b7-6511-4f9e-8be5-e49ff67dd00e")),
			entry("금정구|전체", List.of("https://api.odcloud.kr/api/3073019/v1/uddi:beb9e4f4-368b-41f0-a17e-dcf1b4a692a8",
					"https://api.odcloud.kr/api/3073115/v1/uddi:879568b7-8459-4987-8af9-d57fd1b533e8_202002191107",
					"https://api.odcloud.kr/api/15035137/v1/uddi:0e73f320-9208-4116-aa99-d75f387d2263",
					"https://api.odcloud.kr/api/15139571/v1/uddi:bb8b2986-d417-4bba-84c2-861143ae2a05")),
			entry("강서구|전체", List.of(
					"https://api.odcloud.kr/api/15025042/v1/uddi:7987613e-3c78-4ff8-a1aa-b1928f70db25_201909041554",
					"https://api.odcloud.kr/api/15023012/v1/uddi:91c3c9ca-cbc4-42c4-ba13-e837b96ac63f_201909041525",
					"https://api.odcloud.kr/api/3045888/v1/uddi:ccf66c7a-29c3-4a02-ae6b-93224421cdf8_201905031004")),
			entry("사하구|전체", List.of(
					"https://api.odcloud.kr/api/15016059/v1/uddi:c7d2ce9c-0984-44b2-956a-af41ba8ce01d_202003231514",
					"https://api.odcloud.kr/api/3045773/v1/uddi:f9cad01a-fd93-4365-ad3e-994b12906428_202001201037",
					"https://api.odcloud.kr/api/15016060/v1/uddi:2f68f282-d9c7-4e64-956e-c4ded837b1df_201905301330")),
			entry("사상구|전체", List.of(
					"https://api.odcloud.kr/api/15055219/v1/uddi:1f4793e7-9cc6-4e72-8e64-fbb4dbcdf502_202003052041",
					"https://api.odcloud.kr/api/15007309/v1/uddi:e0c7399b-996d-4903-bdc5-ab867fc49e6d",
					"https://api.odcloud.kr/api/15055218/v1/uddi:7020473f-5e80-4ef2-8444-802f78373d53")),
			entry("연제구|전체", List.of("https://api.odcloud.kr/api/15051406/v1/uddi:a0bb6018-2834-4462-ab42-e1f00d903550",
					"https://api.odcloud.kr/api/3082195/v1/uddi:d4710abc-e17d-469c-93ba-e709845cf9da_201906191319")),
			entry("기장군|전체", List.of("https://api.odcloud.kr/api/15030106/v1/uddi:6ff6a15b-7b5e-4989-8533-dd5734e759ed",
					"https://api.odcloud.kr/api/15004397/v1/uddi:0ceb8ea2-9ee0-47da-aa1f-c8859b5cd2c3",
					"https://api.odcloud.kr/api/15047997/v1/uddi:c49c64ff-878c-4d26-a7d8-a4ad27365594_202002040926")));

	// 병렬 호출 (오버로드 버전)
	@Async
	public CompletableFuture<List<BusanFacility>> fetchApi(String url, String districtFilter) {
		log.info("🚀 비동기 호출 시작: {}", url);
		log.info("✅ 응답 완료: {}", url);
		
	    try {
	    	String fullUrl = url + "?serviceKey=" + serviceKey
	                + "&page=1"
	                + "&perPage=100";


	        String response = restTemplate.getForObject(fullUrl, String.class);

	        JsonNode root;

	        // JSON인지 XML인지 판별
	        if (response.trim().startsWith("{")) {
	            ObjectMapper jsonMapper = new ObjectMapper(); // JSON 파싱
	            root = jsonMapper.readTree(response);
	        } else {
	            XmlMapper xmlMapper = new XmlMapper(); // XML 파싱
	            root = xmlMapper.readTree(response);
	        }

	        return CompletableFuture.completedFuture(parseFacilityData(root, districtFilter, url));

	    } catch (Exception e) {
	        log.warn("❗API 호출 실패: {}", url, e);
	        return CompletableFuture.completedFuture(Collections.emptyList());
	    }
	}

	@Override
	@Cacheable(value = "facilityCache", key = "#district + '|' + #category")
	public List<BusanFacility> getFacilities(String district, String category) {

	    if (category == null || category.isBlank()) {
	        category = "전체";
	    }

	    log.info("📌 getFacilities() 호출됨 - district: {}, category: {}", district, category);

	    // 🔑 Key를 항상 부산광역시 기준으로 구성
	    String key = district.replace("부산광역시 ", "") + "|" + category;

	    List<String> urls = apiUrlMap.getOrDefault(key, Collections.emptyList());

	    log.info("📦 호출 대상 URL 수: {}", urls.size());
	    urls.forEach(url -> log.info("➡️ 호출 대상 URL: {}", url));

	    if (urls.isEmpty()) return Collections.emptyList();

	    List<CompletableFuture<List<BusanFacility>>> futures = new ArrayList<>();
	    for (String url : urls) {
	        futures.add(selfProxy.fetchApi(url, district));
	    }

	    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

	    return futures.stream().flatMap(f -> f.join().stream()).collect(Collectors.toList());
	}

	private List<BusanFacility> parseFacilityData(JsonNode root, String districtFilter, String url) {
	    List<BusanFacility> result = new ArrayList<>();

	    JsonNode itemsNode = root.path("data");
	    if (itemsNode.isMissingNode() || !itemsNode.isArray()) return result;

	    for (JsonNode item : itemsNode) {
	    	String address = getFirst(item, "소재지도로명주소", "소재지지번주소", "주소", "소재지", "도로명주소");

	    	// 실제 주소에 districtFilter 포함 안되면 스킵
	    	if (address != null && !address.contains(districtFilter)) continue;
	        BusanFacility dto = new BusanFacility();

	        dto.setFacilityName(getFirst(item, "시설명", "시설명(운영법인)", "기관명", "시설-기관명", "노인복지관명", "경로당명"));
	        dto.setAddress(getFirst(item, "소재지도로명주소", "소재지지번주소", "주소", "소재지", "도로명주소"));
	        dto.setPhone(getFirst(item, "전화번호", "연락처", "기관전화번호","facilityName"));
	        // dto.setCategory();
	        dto.setDistrict(districtFilter);
	        
	        dto.setFacilityName(getFirst(item, "facility_name", "시설명", "기관명")); // 영어 응답 필드 포함
	        dto.setAddress(getFirst(item, "road_address", "소재지도로명주소", "주소"));
	        dto.setPhone(getFirst(item, "tel", "전화번호", "연락처"));
	        dto.setDistrict(getFirst(item, "gugun", "구군"));
	        dto.setLatitude(parseDouble(item, "lat", "위도"));
	        dto.setLongitude(parseDouble(item, "lon", "경도"));

	        dto.setManagingAgency(getFirst(item, "운영기관명"));
	        dto.setDataReferenceDate(getFirst(item, "데이터기준일자"));
	        dto.setOperatorType(getFirst(item, "운영주체구분"));
	        dto.setEmployeeCount(getFirst(item, "종사자수"));
	        dto.setCapacity(getFirst(item, "입소정원수"));
	        dto.setCurrentResidents(getFirst(item, "입소인원수"));
	        dto.setChildResidents(getFirst(item, "입소아동수"));

	        dto.setScale(getFirst(item, "규모"));
	        dto.setOperator(getFirst(item, "운영주체"));
	        dto.setDirector(getFirst(item, "시설장"));
	        dto.setCurrentUsers(getFirst(item, "이용현원", "이용인원"));
	        dto.setStaffCount(getFirst(item, "직원수"));
	        dto.setFax(getFirst(item, "팩스번호"));
	        dto.setInstallDate(getFirst(item, "설치일"));

	        dto.setFacilityType(getFirst(item, "시설종류"));
	        dto.setPublicOrPrivate(getFirst(item, "공공/민간"));
	        dto.setOperationMethod(getFirst(item, "운영방법"));
	        dto.setLeaderName(getFirst(item, "단체장명"));
	        dto.setRepresentative(getFirst(item, "운영대표자"));

	        dto.setInstitutionName(getFirst(item, "기관명"));
	        dto.setProjectName(getFirst(item, "사업명"));
	        dto.setProgramName(getFirst(item, "프로그램명"));
	        dto.setContent(getFirst(item, "내용"));
	        dto.setTarget(getFirst(item, "대상"));
	        dto.setFee(getFirst(item, "이용료"));
	        dto.setNote(getFirst(item, "비고"));

	        dto.setProgramTitle(getFirst(item, "강좌명"));
	        dto.setStartTime(getFirst(item, "교육시작시간"));
	        dto.setEndTime(getFirst(item, "교육종료시간"));
	        dto.setDayOfWeek(getFirst(item, "요일"));
	        dto.setInstructor(getFirst(item, "강사명"));
	        dto.setProgramTarget(getFirst(item, "이용대상"));
	        dto.setProgramFee(getFirst(item, "교육비"));
	        dto.setProgramLocation(getFirst(item, "교육장소"));
	        dto.setInquiry(getFirst(item, "문의전화", "문의 전화"));
	        dto.setProgramNote(getFirst(item, "비고"));
	        dto.setProgramContent(getFirst(item, "주요프로그램", "프로그램내용"));
	        dto.setProgramTime(getFirst(item, "시간"));

	        dto.setFoundingYear(getFirst(item, "설립연도"));
	        dto.setFoundingStandardCapacity(getFirst(item, "설립기준 정원"));
	        dto.setCapacityChange(getFirst(item, "정원변경"));

	        dto.setStatus(getFirst(item, "영업상태명"));
	        dto.setEstablishDate(getFirst(item, "건립일자"));
	        dto.setBuildingArea(getFirst(item, "건물면적"));

	        dto.setReservationMethod(getFirst(item, "예약방법"));
	        dto.setCompletionDate(getFirst(item, "준공일자", "준공(이관)"));
	        dto.setConvenienceFacility(getFirst(item, "부대편의시설"));

	        dto.setFacilityKind(getFirst(item, "시설종류명"));

	        dto.setLatitude(parseDouble(item, "위도", "LAT"));
	        dto.setLongitude(parseDouble(item, "경도", "LNG"));

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