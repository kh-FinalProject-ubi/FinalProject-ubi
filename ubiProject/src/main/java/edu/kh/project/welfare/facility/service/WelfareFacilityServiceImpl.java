package edu.kh.project.welfare.facility.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.WelfareFacility;
import edu.kh.project.welfare.facility.dto.WelfareFacilityResponse;
import edu.kh.project.welfare.facility.mapper.RegionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WelfareFacilityServiceImpl implements WelfareFacilityService {

	private final RegionMapper regionMapper;

	@Value("${public.api.service-key}")
	private String serviceKey;

	@Override
	public List<WelfareFacility> getFacilitiesByRegion(String city, String district) {

		log.info("🧭 getFacilitiesByRegion() 호출됨 - city: {}, district: {}", city, district);

		var apiInfo = regionMapper.selectApiInfo(city, district);
		log.debug("🧪 조회된 apiInfo: {}", apiInfo);

		if (apiInfo == null || apiInfo.getApiUrl() == null) {
			log.warn("❌ API 정보 없음 또는 URL 미등록: city={}, district={}", city, district);
			return Collections.emptyList();
		}

		// RestTemplate 생성 (UTF-8 인코딩)
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.getMessageConverters().add(0, new org.springframework.http.converter.StringHttpMessageConverter(
				java.nio.charset.StandardCharsets.UTF_8));

		// API URL 생성
		String url = String.format(apiInfo.getApiUrl(), serviceKey);
		log.info("📡 외부 API 호출 URL: {}", url);

		try {
			String xmlResponse = restTemplate.getForObject(url, String.class);

			if (xmlResponse == null || xmlResponse.isBlank()) {
				log.warn("📭 응답 본문이 비어 있음");
				return Collections.emptyList();
			}

			log.info("📄 응답 XML 일부: {}",
					xmlResponse.substring(0, Math.min(300, xmlResponse.length())).replaceAll("\n", ""));

			XmlMapper xmlMapper = new XmlMapper();
			WelfareFacilityResponse response = xmlMapper.readValue(xmlResponse, WelfareFacilityResponse.class);

			List<WelfareFacility> facilities = response.getRow();

			if (facilities != null && !facilities.isEmpty()) {
				log.info("✅ 파싱된 시설 수: {}", facilities.size());

				for (WelfareFacility f : facilities) {
					log.debug("🏠 시설명: {}, 주소: {}", f.get시설명(), f.get주소());
				}
				return facilities;
			} else {
				log.warn("📭 파싱 성공했지만 시설 목록이 비어 있음");
				return Collections.emptyList();
			}

		} catch (Exception e) {
			log.error("💥 복지시설 XML API 호출 중 예외 발생", e);
			return Collections.emptyList();
		}
	}
}