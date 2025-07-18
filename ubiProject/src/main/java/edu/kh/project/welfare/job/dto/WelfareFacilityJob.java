package edu.kh.project.welfare.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor  
public class WelfareFacilityJob {
	    private String jobTitle;         // 채용정보
	    private String jobStartDate;     // 채용 시작일
	    private String jobEndDate;       // 채용 마감일
	    private String jobSalary;        // 임금 조건
	    private String jobPosition;      // 채용 분야
	    private String jobContact;       // 담당자
	    private String jobContactTel;    // 담당자 전화번호
	    private String jobRequirement;   // 자격 조건 요약
	    private String regionDistrict;   // 시군구
	    private String regionCity;       // 시도
	    private String jobAddress;       // 주소
	    private String apiSource;
	    private String apiSourceUrl; 
	
}
