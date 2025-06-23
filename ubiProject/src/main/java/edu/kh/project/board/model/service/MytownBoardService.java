package edu.kh.project.board.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.project.board.model.dto.Board;

public interface MytownBoardService {
	
	/**
	 * 시군구가 동일한 작성자의 게시글 목록조회 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	List<Board> selectLocalBoardList(String regionDistrict, String regionCity);


	
}

