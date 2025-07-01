package edu.kh.project.board.model.service;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.member.model.dto.Member;

public interface MytownBoardService {
	
	/**
	 * 시군구가 동일한 작성자의 게시글 목록조회 
	 * @param regionDistrict
	 * @param i
	 * @return
	 */
	 List<Board> getLocalBoardList(int page);
	 Pagination getPagination(int page);
	 
	 
	/**
	 * 상세조회
	 * @param boardNo
	 * @return
	 */
	   Board selectLocalBoardDetail(int boardNo);
	   
	   
	 /**
	  * 글쓰기
	  * @param dto
	  * @return
	  */
	    int writeBoard(Board dto, List<MultipartFile> images) throws Exception;
	    void insertHashtag(int boardNo, String tag);


//	    String saveBoardImage(MultipartFile uploadFile) throws IOException;

}

