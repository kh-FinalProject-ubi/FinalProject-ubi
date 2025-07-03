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
    private String operatorType;       // 운영주체구분
    private String employeeCount;      // 종사자수(명)
    private String capacity;           // 입소정원수(명)
    private String currentResidents;   // 입소인원수(명)
    private String childResidents;     // 입소아동수(명)
    
    private String scale;           // 규모
    private String operator;        // 운영주체
    private String director;        // 시설장
    private String currentUsers;    // 이용현원
    private String staffCount;      // 직원수
    private String fax;             // 팩스번호
    private String installDate;     // 설치일
    
    private String facilityType;       // 시설종류
    private String publicOrPrivate;    // 공공/민간
    private String operationMethod;    // 운영방법
    private String leaderName;         // 단체장명
    private String representative;     // 운영대표자
    
	private String institutionName;   // 기관명
    private String projectName;       // 사업명
    private String programName;       // 프로그램명
    private String content;           // 프로그램 내용
    private String target;            // 대상
    private String fee;              // 이용료
    private String note;             // 비고
    
    private String additionalInfo;
}
