package edu.kh.project.welfare.facility.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import edu.kh.project.welfare.facility.dto.JejuFacility;
import edu.kh.project.welfare.facility.dto.JejuFacilityApiResponse;
import edu.kh.project.welfare.facility.dto.JejuFacilityResponse;


@Service
public class JejuFacilityServiceImpl implements JejuFacilityService {

    private static final String BASE_URL =
            "https://www.jeju.go.kr/rest/JejuWelfareFacilitieService/getJejuWelfareFacilitieList";


    @Override
    public List<JejuFacility> getJejuFacilityList(int startPage, int pageSize) {

        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                .queryParam("startPage", startPage)
                .queryParam("pageSize", pageSize)

                .toUriString();

        RestTemplate restTemplate = new RestTemplate();
        String xml = restTemplate.getForObject(url, String.class);

        List<JejuFacilityResponse> responseList = parseXml(xml);

        return responseList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private List<JejuFacilityResponse> parseXml(String xml) {
        try {
            XmlMapper xmlMapper = new XmlMapper();
            
            // 🔁 전체 응답 루트로 파싱해야 함!
            JejuFacilityApiResponse apiResponse = xmlMapper.readValue(xml, JejuFacilityApiResponse.class);
            
            return apiResponse.getItems(); // ✔ 정상적으로 List 반환
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    
    private String categorizeFacility(String name) {
        if (name.matches(".*(체육|경기장|수영장|운동장|야영장|스포츠|헬스).*")) {
            return "체육시설";
        }
        if (name.matches(".*(요양|재가노인|노인요양|장기요양|치매|실버).*")) {
            return "요양시설";
        }
        if (name.matches(".*(의료|재활|정신건강|치료센터|건강|병원|보건).*")) {
            return "의료시설";
        }
        if (name.matches(".*(지원센터|센터|사회복지관|다문화|가정|자활|복지관|행정).*")) {
            return "행정시설";
        }
        return "전체";
    }

    private JejuFacility convertToDto(JejuFacilityResponse res) {
        List<String> targets = new ArrayList<>();
        if (res.isTypeChild()) targets.add("아동");
        if (res.isTypeSir()) targets.add("노인");
        if (res.isTypeWoman()) targets.add("여성");
        if (res.isTypeObstacle()) targets.add("장애인");
        if (res.isTypeLowIncome()) targets.add("저소득층");
        if (res.isTypeYouth()) targets.add("청소년");

        String[] addrParts = res.getAddr().split(" ");
        String district = addrParts.length > 0 ? addrParts[0] : "";
        String city = "제주특별자치도";

        // 카테고리 분류 예시 (원하면 더 많은 규칙 추가 가능)
        String category = "";
        String name = res.getName();
        if (name.contains("체육") || name.contains("야영장")) category = "체육시설";
        else if (name.contains("요양") || name.contains("복지")) category = "요양시설";
        else if (name.contains("의료") || name.contains("재활")) category = "의료시설";
        else if (name.contains("센터") || name.contains("지원")) category = "행정시설";
        else category = "기타";

        return JejuFacility.builder()
                .facilityId(res.getSeq() + "jejuFacility")
                .facilityName(res.getName())
                .welfareTargets(targets)
                .address(res.getAddr())
                .phone(res.getPhone())
                .city(city)
                .district(district)
                .latitude(Double.parseDouble(res.getLatitude()))
                .longitude(Double.parseDouble(res.getLongitude()))
                .category(category)
                .build();
    }
}
