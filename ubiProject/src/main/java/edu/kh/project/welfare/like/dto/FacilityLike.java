package edu.kh.project.welfare.like.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class FacilityLike {

	private Long memberNo;             // 회원 번호 (찜한 사용자)
	
	@JsonProperty("facilityName")
    private String facilityName;       // 시설명
	
    private String regionCity;         // 시/도
    private String regionDistrict;     // 시/군/구
    private String category;           // 카테고리
    private String description;        // 시설 소개 또는 설명
    private String agency;             // 운영기관명
    private String facilityAddr;       // 시설 주소
    private String lat;                // 위도
    private String lng;                // 경도

    // 아래는 서버에서 내부 생성용 (임시 API ID)
    private String facilityApiServiceId;  // 공공 API에서 불안정 → 서버 생성 가능
}
