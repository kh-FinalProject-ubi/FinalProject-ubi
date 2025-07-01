package edu.kh.project.welfare.facility.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.kh.project.welfare.facility.dto.GangwonFacility;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GangwonFacilityServiceImpl implements GangwonFacilityService {

    @Value("${gangwon.api.key}")
    private String apiKey;

    @Override
    public List<GangwonFacility> getFacilitiesByRegion(String city, String district) {
        List<GangwonFacility> result = new ArrayList<>();

        String normalizedCity = normalizeCity(city); // ✅ 시도명 정규화
        String target = (district != null && !district.isEmpty()) ? district : normalizedCity;

        switch (target) {
            case "춘천시" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15074349/v1/uddi:5b789896-909b-4f5c-8d67-ec1b8cb062a4", "한부모", normalizedCity, district));
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15074350/v1/uddi:1476629f-003c-48c1-b5fd-8090cf49fc19", "노인", normalizedCity, district));
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15130193/v1/uddi:e2007329-5808-47e7-8f49-9ca6714fe67a", "청소년", normalizedCity, district));
            }
            case "원주시" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/3068600/v1/uddi:a9e6bf40-9f38-4cd3-bd3f-d7f771053c30", "장애인", normalizedCity, district));
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/3060622/v1/uddi:3a91b113-71a6-481f-a167-9e12c51d0eff", "노인", normalizedCity, district));
            }
            case "강릉시" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15076241/v1/uddi:5caa0365-c9e5-46ea-a75d-fdc8188c411a", "장애인", normalizedCity, district));
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15004498/v1/uddi:6bf33247-7c4c-422c-b056-a7e52edd4aa9", "노인", normalizedCity, district));
            }
            case "속초시" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15081462/v1/uddi:0a7ed181-17f5-48af-9ef5-a4630f3fbe4e", "일반", normalizedCity, district));
            }
            case "삼척시" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15013641/v1/uddi:8ad273ad-b019-4630-9178-acba55f6614e", "노인", normalizedCity, district));
            }
            case "횡성군" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15046142/v1/uddi:1a0656e1-03d8-4ce0-9527-ceb51968b3f5", "노인", normalizedCity, district));
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/3034641/v1/uddi:492c87ec-e82e-42ff-b48d-aaf2ad29391a_201712011559", "노인", normalizedCity, district));
            }
            case "평창군" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15099850/v1/uddi:bcd8e886-cbc1-4aae-bab1-ca7e3cf1a9c1", "노인", normalizedCity, district));
            }
            case "화천군" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/3075828/v1/uddi:6f20d6e4-b148-4b38-af3a-eb3fc0d16059_201711071352", "일반", normalizedCity, district));
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/3038562/v1/uddi:2bbba1e0-7b52-4339-a400-fe7fd7432f2e_201711071352", "노인", normalizedCity, district));
            }
            case "인제군" -> {
                result.addAll(fetchFromJson("https://api.odcloud.kr/api/15007685/v1/uddi:bcd1ce10-b3e0-4c5e-b8eb-9308ba60c028", "노인", normalizedCity, district));
            }
            default -> log.info("❌ 처리 대상이 아닌 시군 요청: {}", target);
        }

        return result;
    }

    /** ✅ 강원 시도명 정규화 */
    private String normalizeCity(String city) {
        if (city == null) return "";
        return city.replace("강원특별자치도", "강원도");
    }

    private List<GangwonFacility> fetchFromJson(String baseUrl, String category, String city, String district) {
        List<GangwonFacility> facilities = new ArrayList<>();
        try {
            String fullUrl = baseUrl + "?serviceKey=" + apiKey + "&perPage=1000";

            RestTemplate restTemplate = new RestTemplate();
            String json = restTemplate.getForObject(fullUrl, String.class);

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(json);
            JsonNode dataRows = root.get("data");

            if (dataRows != null && dataRows.isArray()) {
                for (JsonNode node : dataRows) {
                    GangwonFacility f = new GangwonFacility();

                    String name = node.has("시설명") ? node.path("시설명").asText("")
                            : node.has("노인복지관명") ? node.path("노인복지관명").asText("")
                            : node.has("시설명(운영법인)") ? node.path("시설명(운영법인)").asText("")
                            : node.has("시설-기관명") ? node.path("시설-기관명").asText("")
                            : node.has("경로당명") ? node.path("경로당명").asText("")
                            : node.has("기관명") ? node.path("기관명").asText("")
                            : node.has("지역별") ? node.path("지역별").asText("")
                            : "(이름 없음)";
                    f.setFacilityName("[" + category + "] " + name);

                    String address = node.has("소재지도로명주소") ? node.path("소재지도로명주소").asText("")
                            : node.has("도로명주소") ? node.path("도로명주소").asText("")
                            : node.has("주소(새주소)") ? node.path("주소(새주소)").asText("")
                            : node.has("소재지") ? node.path("소재지").asText("")
                            : node.has("위치") ? node.path("위치").asText("")
                            : node.has("주소") ? node.path("주소").asText("")
                            : node.has("새주소(도로명주소)") ? node.path("새주소(도로명주소)").asText("")
                            : node.has("기존주소") ? node.path("기존주소").asText("") : "";
                    f.setRefineRoadnmAddr(address);

                    String tel = node.has("전화번호") ? node.path("전화번호").asText("")
                            : node.has("연락처") ? node.path("연락처").asText("") : "";
                    f.setTel(tel);

                    f.setLat(node.has("위도") ? node.path("위도").asText(null) : null);
                    f.setLng(node.has("경도") ? node.path("경도").asText(null) : null);

                    f.setHomepage(node.has("홈페이지") ? node.path("홈페이지").asText("") : "");
                    f.setRegionCity(city);
                    f.setRegionDistrict(district);

                    f.setOperatingOrg(node.path("운영기관명").asText(""));
                    f.setMealTime(node.path("급식시간").asText(""));

                    f.setType(category);
                    f.setCategory("복지시설");

                    facilities.add(f);
                }
            }

        } catch (Exception e) {
            log.error("❌ JSON API 호출 실패: {}, {}", category, baseUrl, e);
        }

        return facilities;
    }
}