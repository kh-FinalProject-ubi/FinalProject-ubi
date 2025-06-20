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
	private int readCount;
	private int boardReportCount;
	

	
	// BOARD 종류 컬럼 
	private int boardCode;
	private int boardType; 
	
	// 별도 BOARD 테이블 컬럼 
	
	private String boardAnswer;
	private int starCount;
	private String postType; // 우리동네 게시판 분류 

	
	// 조인된 테이블 컬럼 ===========================================

	private String apiServiceId;
	private String facilityapiServiceId;
	
	private int memberNo;
	

	


	
	// MEMBER 테이블 조인
	private String memberNickname;

	// 목록 조회 시 상관쿼리 결과
	private int commentCount;  // 댓글 수
	private int likeCount;    // 좋아요 수

	// 게시글 작성자 프로필 이미지
	private String profileImg;

	// 게시글 이미지
	private String thumbnail;

	// 특정 게시글 이미지 목록 리스트
	 private List<BoardImg> imageList;

	// 특정 게시글 작성된 댓글 목록 리스트
	 private List<Comment> commentList;

	// 좋아요 여부 확인
	private int likeCheck;


//	// 관리자페이지에서 필요
//	// 게시판 종류명
//	private String boardName;

}
