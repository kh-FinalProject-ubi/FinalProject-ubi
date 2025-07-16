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
    
    private String operator;
    
    private String currentResidents; // 수용인원
    
    private String compositeBuilding;
    private String dayStaff;
    private String nightStaff;
    private String elderlyCount;
    private String buildingScale;
    private String evacuationSpace;
    private String smokeControl;
    private String exteriorFinish;
    private String buildingPermitDate;
    private String directStairs;
    private String emergencyExit;
    private String evacuationEquipment;
    private String sprinkler;
    private String simpleSprinkler;
    private String autoFireDetection;
    private String autoFireAlert;
    private String smokeAlarm;


}