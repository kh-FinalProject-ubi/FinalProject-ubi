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
public class Facility {

	private String facilityNo;				// 채용 번호
	private String facilityApiServiceId;	// 외부 API 기분 고유 식별
	private int memberNo;					// 회원 고유번호
	private String facilityName;			// 시설명
	private String facilityKindNM;			// 시설 종류명
	private String facilityBizNo;			// 사업자 등록 번호
	private String Owner;					// 대표자명
	private String eventTitle;				// 행사 제목
	private String eventDateStart;			// 행사 시작일
	private String eventDateEnd;			// 행사 종료일
	private String eventContent;			// 행사 내용 요약
	private String requirement;				// 입장 가능 기준 조건
	private String jjTime;					// 찜시간
	private String updatedAt;				// 알림 발송 시간
	private char jjDelFl;					// 찜 취소 여부
	private char alaramSentFl;				// 알림 발송 여부
	private String rcptbgndt;				// 접수일시
	private String rcptenddt;				// 접수종료일
	private String regionDistrict;	// 시군구명
	private String regionCity;		// 시도
}
