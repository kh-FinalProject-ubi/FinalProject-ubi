package edu.kh.project.welfare.benefits.model.dto;

public class Benefits {
	
	private int serviceNo;			// 서비스 번호
	private String apiServiceId;	// 외부 API 기분 고유 식별
	private int memberNo;			// 회원 고유번호
	private String agency;			// 제공기관명
	private String serviceName;		// 복지 서비스명
	private String description;		// 복지 상세 설명
	private String category;		// 복지분류
	private String receptionMethod;	// 신청 방법
	private String receptionStart;	// 신청 시작일
	private String receptionEnd;	// 신청 마감일
	private String url;				// 상세 안내 URL
	private int servicePay;			// 유료여부
	private int lat;				// 위도
	private int lng;				// 경도
	private String regionDistrjct;	// 시군구명
	private String regionCity;		// 시도
	private String jjTime;			// 찜시간
	private String updatedAt;		// 알림 발송 시간
	private char jjDelFl;			// 찜 취소 여부
	private char alaramSentFl;		// 알림 발송 여부
	
	

}
