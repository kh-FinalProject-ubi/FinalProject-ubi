package edu.kh.project.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentLike {

	private int commentNo;
	private String commentContent;
	private String commentDate;
	private String commentUpdateDelFl;
	private int memberNo;
	private int commentParentNo;
	
	// 댓글 조회 시 회원 프로필, 닉네임
	private String memberNickname;
	private String profileImg;
	
	private int likeCount;
	
	private int boardNo;
	private int boardTitle;
	private String postType;
}
