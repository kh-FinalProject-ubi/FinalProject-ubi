package edu.kh.project.board.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardLike {

	private int memberNo;
	private int boardNo;
	private String boardTitle;
	private String boardContent;
	private String boardDate;
	private String boardUpdate;
	
	private String hashtag;
	
	private String postType;
	
	private String memberNickname;
}
