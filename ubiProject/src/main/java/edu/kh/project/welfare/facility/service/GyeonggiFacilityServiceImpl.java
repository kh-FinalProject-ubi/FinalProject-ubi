package edu.kh.project.welfare.facility.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;
import edu.kh.project.welfare.facility.dto.RegionApiInfo;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GyeonggiFacilityServiceImpl implements GyeonggiFacilityService {

    @Value("${gyeonggi.api.key}")
    private String serviceKey;

    private String getApiUrl(String apiType) {
        return switch (apiType) {
            case "old" -> "https://openapi.gg.go.kr/HtygdWelfaclt?KEY=%s";
            case "old2" -> "https://openapi.gg.go.kr/SenircentFaclt?KEY=%s";
            case "old3" -> "https://openapi.gg.go.kr/OldpsnLsrWelfaclt?KEY=%s";
            case "child" -> "https://openapi.gg.go.kr/Childwelfarefaclt?KEY=%s";
            case "public" -> "https://openapi.gg.go.kr/PublicFacilityOpening?KEY=%s";
            case "disabled" -> "https://openapi.gg.go.kr/Ggminddspsnreturn?KEY=%s";
            case "disabled2" -> "https://openapi.gg.go.kr/Ggdspsnrelatefaclt?KEY=%s";
            default -> throw new IllegalArgumentException("지원하지 않는 API 유형: " + apiType);
        };
    }

    private String normalize(String str) {
        if (str == null) return "";
        return str.replaceAll("\\s+", "").trim().toLowerCase();
    }

    @Override
    public List<GyeonggiFacility> getFacilitiesByRegion(String city, String district) {
        List<GyeonggiFacility> totalFacilities = new ArrayList<>();

        for (String apiType : List.of("old", "old2", "old3", "child", "public", "disabled", "disabled2")) {
            List<GyeonggiFacility> oneTypeList = fetchFromApi(city, district, apiType);
            totalFacilities.addAll(oneTypeList);
        }

        log.info("✅ 전체 병합된 시설 수: {}", totalFacilities.size());
        return totalFacilities;
    }

    private List<GyeonggiFacility> fetchFromApi(String city, String district, String apiType) {
        String cleanCity = city.contains("^^^") ? city.split("\\^\\^\\^")[1] : city;
        if ("경기".equals(cleanCity)) cleanCity = "경기도";

        log.debug("🔍 [API:{}] 정제된 city: {}, district: {}", apiType, cleanCity, district);

        String baseUrl = getApiUrl(apiType);
        List<GyeonggiFacility> allFacilities = new ArrayList<>();
        int page = 1;
        int pageSize = 1000;

        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
            XmlMapper xmlMapper = new XmlMapper();

            while (true) {
                String url = String.format("%s&Type=xml&pIndex=%d&pSize=%d", String.format(baseUrl, serviceKey), page, pageSize);
                log.info("📡 [{}] API 호출 URL: {}", apiType, url);

                String xml = restTemplate.getForObject(url, String.class);
                JsonNode root = xmlMapper.readTree(xml);
                JsonNode rowNode = root.get("row");

                if (rowNode == null || !rowNode.isArray() || rowNode.size() == 0) {
                    log.info("🔚 [{}] 더 이상 데이터 없음. page={}", apiType, page);
                    break;
                }

                for (JsonNode node : rowNode) {
                    GyeonggiFacility facility = new GyeonggiFacility();

                    log.info("📞 DETAIL_TELNO: {}", node.get("DETAIL_TELNO"));
                    
                    if (node.has("FACLT_NM")) {
                        facility.setFacilityName(node.get("FACLT_NM").asText());
                    } else if (node.has("OPEN_FACLT_NM")) {
                        facility.setFacilityName(node.get("OPEN_FACLT_NM").asText());
                    } else if (node.has("BIZPLC_NM")) {
                        facility.setFacilityName(node.get("BIZPLC_NM").asText());
                    } else if (node.has("INST_NM")) {
                        facility.setFacilityName(node.get("INST_NM").asText());
                    }

                    if (node.has("REFINE_ROADNM_ADDR")) {
                        facility.setRefineRoadnmAddr(node.get("REFINE_ROADNM_ADDR").asText());
                    } else if (node.has("REFINE_LOTNO_ADDR")) {
                        facility.setRefineRoadnmAddr(node.get("REFINE_LOTNO_ADDR").asText());
                    }

                    if (node.has("REFINE_WGS84_LAT")) {
                        facility.setLat(node.get("REFINE_WGS84_LAT").asText());
                    }
                    if (node.has("REFINE_WGS84_LOGT")) {
                        facility.setLng(node.get("REFINE_WGS84_LOGT").asText());
                    }
                    if (node.has("DETAIL_TELNO")) {
                        facility.setTel(node.get("DETAIL_TELNO").asText());
                    } else if (node.has("TELNO")) {
                        facility.setTel(node.get("TELNO").asText());
                    } else if (node.has("PHONE")) {
                        facility.setTel(node.get("PHONE").asText());
                    } else if (node.has("TELNO_INFO")) {
                        facility.setTel(node.get("TELNO_INFO").asText());
                    }
                    
                    if (node.has("HMPG_ADDR")) {
                        facility.setHomepage(node.get("HMPG_ADDR").asText());
                    } else if (node.has("SVCURL")) {
                        facility.setHomepage(node.get("SVCURL").asText());
                    } else if (node.has("HMPG_URL")) {
                        facility.setHomepage(node.get("HMPG_URL").asText());
                    }

                    facility.setApiType(apiType);

                    // ✅ 핵심: apiType에 따른 type/category 매핑
                    switch (apiType) {
                        case "old", "old2", "old3" -> {
                            facility.setType("노인");
                            facility.setCategory("요양시설");
                        }
                        case "child" -> {
                            facility.setType("아동");
                            facility.setCategory("행정시설");
                        }
                        case "public" -> {
                            facility.setType("전체");
                            facility.setCategory("행정시설");
                        }
                        case "disabled", "disabled2" -> {
                            facility.setType("장애인");
                            facility.setCategory("의료시설");
                        }
                        default -> {
                            facility.setType("전체");
                            facility.setCategory("기타");
                        }
                    }

                    if (facility.getFacilityName() == null || facility.getRefineRoadnmAddr() == null)
                        continue;

                    allFacilities.add(facility);
                }

                log.info("📄 [{}] page {} 완료. 누적 개수: {}", apiType, page, allFacilities.size());
                page++;
            }

            // ✅ 시군구 정규화 처리 (특례시 적용)
            if ("수원시".equals(district)) {
                district = "수원특례시";
            } else if ("고양시".equals(district)) {
                district = "고양특례시";
            } else if ("용인시".equals(district)) {
                district = "용인특례시";
            } else if ("성남시".equals(district)) {
                district = "성남특례시";
            }
            
         // ✅ 역정규화 (비교용 district: 여전히 주소에는 "고양시" 등 일반 시로 들어있음)
            String comparisonDistrict = switch (district) {
                case "수원특례시" -> "수원시";
                case "고양특례시" -> "고양시";
                case "용인특례시" -> "용인시";
                case "성남특례시" -> "성남시";
                default -> district;
            };


            String simplifiedDistrict = comparisonDistrict.contains(" ") ? comparisonDistrict.split(" ")[0] : comparisonDistrict;
       
            
            String normCity = normalize(cleanCity);
            String normDistrict = normalize(simplifiedDistrict);
            String normDistrictOriginal = normalize(district);     // 고양특례시 → 고양특례시

            List<GyeonggiFacility> filtered = new ArrayList<>();
            for (GyeonggiFacility facility : allFacilities) {
                String addressNorm = normalize(facility.getRefineRoadnmAddr());

                if (addressNorm.contains(normCity) &&
                        (addressNorm.contains(normDistrict) || addressNorm.contains(normDistrictOriginal))) {
                    facility.setRegionCity(cleanCity);
                    facility.setRegionDistrict(district);
                    filtered.add(facility);
                }
                
             // ✅ 고유 식별자 생성 로직 추가 (Serviceid)
                String namePart = facility.getFacilityName().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
                String addrPart = facility.getRefineRoadnmAddr().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();

                int hashCode = Math.abs((namePart + addrPart).hashCode()); // 양수 해시코드
                String hashString = Integer.toString(hashCode, 36); // 36진수 (영문+숫자 압축)

                String serviceId = "gye" + apiType.charAt(0) + hashString; // 예: "gyecx93da"
                if (serviceId.length() > 10) {
                    serviceId = serviceId.substring(0, 10); // 최대 10자 제한
                }

                facility.setServiceId(serviceId);
            }

            log.info("✅ [{}] 필터링된 시설 수: {}", apiType, filtered.size());
            return filtered;

        } catch (Exception e) {
            log.error("💥 [{}] API 처리 실패", apiType, e);
            return Collections.emptyList();
        }
    }
}