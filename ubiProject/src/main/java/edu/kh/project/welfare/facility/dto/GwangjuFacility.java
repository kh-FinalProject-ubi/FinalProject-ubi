package edu.kh.project.welfare.facility.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GwangjuFacility {

    private String type;                 // 시설 분류
    private String facilityType;         // 세부 시설 유형
    private String facilityName;         // 시설명
    private String administrativeDong;   // 행정동명
    private String address;              // 도로명 주소
    private String dataDate;             // 데이터 기준일자

    // 선택적으로 추가 가능 (호출 메타 정보)
    private String district;             // eg. 동구
    private String category;             // eg. 노인복지
    
    private String phone;

    private Double latitude;
    private Double longitude;
    
    private String area;              // 면적
    private String buildDate;         // 조성일자
    private String facilityStatus;    // 이용시설현황
    
    private String dongName;          // 동명
    private String seniorCenterName;  // 경로당명
    private String form;              // 형태
    private String hall;             // 당 장 (→ 의미에 따라 'hall' 또는 다른 명칭으로 바꿀 수 있음)
    
    private String categoryType;       // 구분 (eg. 노인복지, 장애인복지 등)
    private String facilityKind;       // 시설종류
    private String capacityStatus;     // 수용정원_현원(명)
    private String employee;           // 종사자
    private String note;               // 비고
    
    private String createdYear;        // 조성연도
    private String fitnessEquipment;  // 체력단련시설
    private String location;          // 위치
    private String department;        // 담당부서
    private String contact;           // 연락처
    private String managingAgency;    // 관리기관명
    
    private String weekdayOperationDays;
    private String weekdayStartTime;
    private String weekdayEndTime;

    private String weekendOperationDays;
    private String weekendStartTime;
    private String weekendEndTime;

    private String closedDays;
    
    private String year;

    private String homeCareServiceCount;
    private String dayNightCareServiceCount;
    private String shortTermCareServiceCount;
    private String homeBathServiceCount;
    private String homeSupportServiceCount;

    private String seniorCenterCount;
    private String seniorSchoolCount;
    private String seniorWelfareCenterCount;
    private String nursingFacilityCount;
    private String nursingGroupHomeCount;
    
    private String eventType;         // 종목 (축구, 농구 등)

    private String buildingFloor;
    private String totalFloorArea;
    private String buildYear;
    
    private String operator;
    private String homepage;
    
    private String representative;      // 대표자
    private String corporationName;     // 법인명
    
    private String faxNumber; // 팩스번호
    
    private String userCount; // 이용자수
    
    private String establishedDate;        // 설립일자
    private String operatorAddress;        // 법인소재지
    private String secretaryGeneral;       // 사무국장
    private String welfareWorkerCount;     // 생활복지사 수
    private String instructorCount;        // 생활지도원 수

    private String director;
    
    private String employeeStatus; // 직원 현황 (직원 수 또는 역할 구성 설명)
    
    private String currentChildCount;
    private String budgetSupport;
    

}