package edu.kh.project.board.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Board {
	
	// BOARD 테이블 컬럼
	private int boardNo;
	private String boardTitle;
	private String boardContent;
	private String boardDate;
	private String boardUpdateDate;
	private String boardDelFl;
    private int boardReadCount;
	private int boardReportCount;
	
	
	// BOARD 종류 컬럼 
	private int boardCode;
	private int boardType; 
	

	// 별도 BOARD 테이블 컬럼 
	
	private String boardAnswer;
	private int starCount; // 후기 게시글인 경우만 사용
	private String postType;  // '후기', '자유', '자랑'
	private String hashtags;  // 쉼표로 연결된 문자열 "#맛집,#서울"
	
	private List<String> hashtagList;
	
	// 조인된 테이블 컬럼 ===========================================

	private String apiServiceId;
	private String facilityApiServiceId;

    // 추가: 지역 필터링용 (회원 테이블에서 join)
    private String regionDistrict;
    private String regionCity;

	
	
	// MEMBER 테이블 조인
	private int memberNo;
	private String memberNickname;
    private String memberImg;
    private String authority;

	// 목록 조회 시 상관쿼리 결과
	private int commentCount;  // 댓글 수
	private int likeCount;    // 좋아요 수

	// 게시글 이미지
	private String thumbnail;
	private String thumbnailImageName;

	// 특정 게시글 이미지 목록 리스트
	 private List<BoardImage> imageList;
	 
	// 복지시설
	 private String facilityName;
	 private String facilityKindCd; 
	 private String facilityAddress;
	 
		// 복지혜택
	 private String welfareName;
	 private String welfareAgency;
	 private String category;


	// 특정 게시글 작성된 댓글 목록 리스트
	 private List<Comment> commentList;

	// 좋아요 여부 확인
	private int likeCheck;
	
	// 게시글 신고 여부 확인
	 private String reportedByMe;

//	 private String ApiServiceId;
	 


}
