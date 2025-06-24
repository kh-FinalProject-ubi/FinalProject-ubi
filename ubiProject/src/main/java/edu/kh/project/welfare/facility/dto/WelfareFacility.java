package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WelfareFacility {

    // 공통 가능 필드 (한글/영문 혼용 대응)
	
    @JsonProperty("시설명")
    @JsonAlias({"어르신복지시설명"}) // 대체 키들
    private String 시설명;

    @JsonProperty("주소")
    @JsonAlias({"소재지도로명주소", "도로명주소"}) 
    private String 주소;

    @JsonProperty("위도")
    private Double 위도;
    
    @JsonProperty("시설홈페이지")
    @JsonAlias({"홈페이지", "url"}) 
    private String 시설홈페이지;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("경도")
    private Double 경도;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("운영주체")
    private String 운영주체;

    @JsonProperty("기관명")
    @JsonAlias({"운영기관명", "관리기관명"}) 
    private String 기관명;

    @JsonProperty("기준일자")
    private String 기준일자;

    @JsonProperty("전화번호")
    @JsonAlias({"운영기관전화번호"}) 
    private String 전화번호;

    @JsonProperty("tel")
    @JsonAlias({"관리기관전화번호"}) 
    private String tel;

    @JsonProperty("행정동")
    private String 행정동;

    // 기타 API 특성에 따라 필요한 컬럼은 자유롭게 확장 가능
}