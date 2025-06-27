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

	// ✅ API 유형별 URL
	private String getApiUrl(String apiType) {
		return switch (apiType) {
		case "old" -> "https://openapi.gg.go.kr/HtygdWelfaclt?KEY=%s";
		case "child" -> "https://openapi.gg.go.kr/Childwelfarefaclt?KEY=%s";
		case "public" -> "https://openapi.gg.go.kr/PublicFacilityOpening?KEY=%s";
		default -> throw new IllegalArgumentException("지원하지 않는 API 유형: " + apiType);
		};
	}

	// ✅ 문자열 정규화
	private String normalize(String str) {
		if (str == null)
			return "";
		return str.replaceAll("\\s+", "").trim().toLowerCase();
	}

	@Override
	public List<GyeonggiFacility> getFacilitiesByRegion(String city, String district, String apiType) {
		String cleanCity = city.contains("^^^") ? city.split("\\^\\^\\^")[1] : city;
		if ("경기".equals(cleanCity))
			cleanCity = "경기도";

		log.debug("🧪 정제된 city: {}, district: {}", cleanCity, district);

		String baseUrl = getApiUrl(apiType);
		List<GyeonggiFacility> allFacilities = new ArrayList<>();
		int page = 1;
		int pageSize = 1000; // 최대값

		try {
			RestTemplate restTemplate = new RestTemplate();
			restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
			XmlMapper xmlMapper = new XmlMapper();

			while (true) {
				String url = String.format("%s&Type=xml&pIndex=%d&pSize=%d", String.format(baseUrl, serviceKey), page,
						pageSize);
				log.info("📡 API 호출 URL: {}", url);

				String xml = restTemplate.getForObject(url, String.class);
				JsonNode root = xmlMapper.readTree(xml);
				JsonNode rowNode = root.get("row");

				if (rowNode == null || !rowNode.isArray() || rowNode.size() == 0) {
					log.info("🔚 더 이상 데이터 없음. page={}", page);
					break;
				}

				for (JsonNode node : rowNode) {
					GyeonggiFacility facility = xmlMapper.treeToValue(node, GyeonggiFacility.class);
					if (facility.getFacilityName() == null || facility.getRefineRoadnmAddr() == null)
						continue;
					allFacilities.add(facility);
				}

				log.info("📄 page {} 완료. 누적 개수: {}", page, allFacilities.size());

				// 다음 페이지로
				page++;
			}

			// ✅ 주소 기준 필터링
			String normDistrict = normalize(district);
			List<GyeonggiFacility> filtered = new ArrayList<>();
			for (GyeonggiFacility facility : allFacilities) {
				String addressNorm = normalize(facility.getRefineRoadnmAddr());
				if (addressNorm.contains(normDistrict)) {
					facility.setRegionCity(cleanCity);
					facility.setRegionDistrict(district);
					filtered.add(facility);
				}
			}

			log.info("✅ 최종 필터링된 시설 수: {}", filtered.size());
			return filtered;

		} catch (Exception e) {
			log.error("💥 API 처리 실패", e);
			return Collections.emptyList();
		}
	}
}