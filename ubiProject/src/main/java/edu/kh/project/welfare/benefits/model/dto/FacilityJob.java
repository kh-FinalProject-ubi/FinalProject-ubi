package edu.kh.project.welfare.benefits.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityJob {

	private int jobNo;						// 채용번호
	private String jobApiServiceID;			// job 외부 API 기준 고유 식별자
	private int memberNo;					// 회원 고유번호
	private String jobTitle;				// 채용 제목
	private String jobFacilityname;			// 채용기관
	private String jobSalAry;				// 임금조건
	private String jobPosition;				// 채용분야
	private String jobRequirement;			// 자격조건 요약
	private String jobcontent;			// 채용내용
	private String rcptbgndt;				// 접수일시
	private String rcptenddt;				// 접수종료일
	private String jjTime;					// 찜시간
	private String updatedAt;				// 알림 발송 시간
	private char jjDelFl;					// 찜 취소 여부
	private char alaramSentFl;				// 알림 발송 여부
}
