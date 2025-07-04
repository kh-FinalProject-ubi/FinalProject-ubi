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
    
    private String programTitle;   // 강좌명
    private String startTime;      // 교육시작시간
    private String endTime;        // 교육종료시간
    private String dayOfWeek;      // 요일
    private String instructor;     // 강사명
    private String programTarget;  // 이용대상
    private String programFee;     // 교육비
    private String programLocation; // 교육장소
    private String inquiry;        // 문의 전화
    private String programNote;    // 비고

    private String programContent;   // 프로그램내용
    private String programTime;      // 시간

    private String foundingStandardCapacity;   // 설립기준 정원
    private String capacityChange;             // 정원변경(정원(년도))
    
    private String status;             // 영업상태명
    private String establishDate;      // 건립일자
    private String buildingArea;       // 건물면적
    
    private String reservationMethod;    // 예약방법
    private String completionDate;       // 준공(이관)
    private String convenienceFacility;  // 부대편의시설
    
    private String facilityKind;
}
