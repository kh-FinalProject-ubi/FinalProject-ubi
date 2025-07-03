package edu.kh.project.welfare.facility.dto;

import lombok.Data;

@Data
public class BusanFacility {
	private String facilityName;      // 장기요양기관
    private String address;           // 주소
    private String phone;             // 전화번호
    private String category;          // 급여종류
    private String district;          // 구군
    private String foundingYear;      // 설립연도
    private String area;              // 연면적
    private Double latitude;          // 위도
    private Double longitude;         // 경도	
    // 시 전체 응답용
    private String managingAgency;
    private String dataReferenceDate;
}
