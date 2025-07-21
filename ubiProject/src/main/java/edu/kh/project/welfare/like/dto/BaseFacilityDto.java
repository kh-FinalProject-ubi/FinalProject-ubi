package edu.kh.project.welfare.like.dto;

public interface BaseFacilityDto {

    String getFacilityName();        // 시설명
    String getRegionCity();         // 시/도
    String getRegionDistrict();     // 시/군/구
    String getCategory();           // 카테고리
    String getDescription();        // 설명
    String getAgency();             // 운영기관
    String getFacilityAddr();       // 주소
    String getLat();                // 위도
    String getLng();                // 경도
}
