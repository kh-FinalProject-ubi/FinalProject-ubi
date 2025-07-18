package edu.kh.project.board.model.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardImage {

	private int imageNo;
	private String imagePath;
	private int imageOrder;
	private String imageName;
	private int boardNo;

	// 게시글 이미지 삽입/수정 할 때 사용
	private MultipartFile uploadFile;

}
