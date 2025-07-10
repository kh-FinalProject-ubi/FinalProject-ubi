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
        
        // ✅ 띄어쓰기 제거하여 비교용 이름 생성
        String name = res.getName();
        String nameNoSpace = name.replaceAll("\\s+", ""); // 모든 공백 제거

        // ✅ 카테고리 자동 분류 로직
        String category;

        if (nameNoSpace.contains("요양원") || nameNoSpace.contains("노인") || nameNoSpace.contains("실버")) {
            category = "요양시설";
        } else if (nameNoSpace.contains("의료") || nameNoSpace.contains("재활") || nameNoSpace.contains("정신")) {
            category = "의료시설";
        } else if (    nameNoSpace.contains("지원센터") ||
        	    nameNoSpace.contains("복지관") ||
        	    nameNoSpace.contains("다문화가족지원센터") ||
        	    nameNoSpace.contains("건강가정지원센터") ||
        	    nameNoSpace.contains("자활센터") ||
        	    nameNoSpace.contains("복지센터") ||
        	    nameNoSpace.contains("복지협회") ||
        	    nameNoSpace.contains("행정복지") ||
        	    nameNoSpace.contains("지역아동센터")||
        	    nameNoSpace.contains("센터")) {
            category = "행정시설";
        } else if (nameNoSpace.contains("체육") || nameNoSpace.contains("운동") || nameNoSpace.contains("경기장") )//||nameNoSpace.contains("야영장"))
        {
            category = "체육시설";
        } else {
            category = "기타";
        }
        
        return JejuFacility.builder()
                .facilityId(res.getSeq() + "jejuFacility")
                .facilityName(res.getName())
                .welfareTargets(targets)
                .address(res.getAddr())
                .phone(res.getPhone())
                .city(city)
                .district(district) // ✅ 프론트 필터링용 필드 추가
                .latitude(Double.parseDouble(res.getLatitude()))
                .longitude(Double.parseDouble(res.getLongitude()))
                .category(category)
                .build();
    }
}
