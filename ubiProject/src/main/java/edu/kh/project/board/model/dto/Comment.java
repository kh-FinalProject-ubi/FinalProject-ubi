package edu.kh.project.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

	private int commentNo;
	private String commentContent;
	private String commentDate;
	private String commentUpdateDelFl;
	private String commentDelFl;
	private int boardNo;
	private int memberNo;
	private int commentParentNo;
	
	// 댓글 조회 시 회원 프로필, 닉네임
	private String memberNickname;
	private String memberImg;
	
	// 댓글 좋아요
	private int commentLike;
	// 댓글 좋아요 유무 확인
	private boolean commentLiked;

	// 해당 댓글이 관리자 댓글인가.
	private String memberRole;
	
	// 누가 신고했는지 확인
	private boolean reportedByMe; 
	
	private String boardTitle;
	private String boardContent;
	private String postType;
}
