package edu.kh.project.board.model.service;

import java.io.IOException;
import java.util.List;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.member.model.dto.Member;

public interface MytownBoardService {
	
	/**
	 * 시군구가 동일한 작성자의 게시글 목록조회 
	 * @param regionDistrict
	 * @param i
	 * @return
	 */
	 List<Board> getLocalBoardList();
	 
	 
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
	    int writeBoard(Board dto);
	    void insertHashtag(int boardNo, String tag);


	    void saveImage(BoardImage image) throws IOException;
}

