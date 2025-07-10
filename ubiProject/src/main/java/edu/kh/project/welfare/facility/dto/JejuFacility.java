package edu.kh.project.welfare.facility.dto;

import java.util.List;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class JejuFacility {
	
	// @JacksonXmlProperty(localName = "seq")
    private String ServiceId; // 예: "jejuFacility181"

    @JacksonXmlProperty(localName = "FACLT_NM")
    private String facilityName;

    @JacksonXmlProperty(localName = "latitude")
    private double latitude;

    @JacksonXmlProperty(localName = "longitude")
    private double longitude;

    @JacksonXmlProperty(localName = "TELNO")
    private String phone;

    @JacksonXmlProperty(localName = "ADDR")
    private String address;

    private String city;      // 시도 정보 ("제주특별자치도" 고정)
    private String district;  // 주소에서 추출된 시군구

    private String category;  // "행정시설", "요양시설" 등으로 서비스에서 분류한 값

    private List<String> welfareTargets; // 예: ["노인", "장애인"]
}
