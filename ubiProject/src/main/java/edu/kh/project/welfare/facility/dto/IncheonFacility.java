package edu.kh.project.welfare.facility.dto;

import lombok.Data;

@Data
public class IncheonFacility {
    private String facilityName;
    private String address;
    private String phone;
    private String category;
    private String district;
    private Double latitude;
    private Double longitude;
    private String note;
    
    private String capacity;
    private String dataDate;

    private String fax;            // 팩스

    private String facilityType;     // 시설구분

    private String scale;            // 시설규모(제곱미터)
    private String staffCount;       // 종사자수
    private String establishDate;    // 설립일자

}