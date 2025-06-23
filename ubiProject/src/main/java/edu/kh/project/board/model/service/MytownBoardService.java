package edu.kh.project.board.model.service;

import java.util.List;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.member.model.dto.Member;

public interface MytownBoardService {
	
	/**
	 * 시군구가 동일한 작성자의 게시글 목록조회 
	 * @param regionDistrict
	 * @param i
	 * @return
	 */
	List<Board> selectLocalBoardList(String regionDistrict, int i);


	   Member login(Member inputMember);


	/** 시군구가 동일한 게시글 목록조회 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	List<Board> selectLocalBoardList(String regionDistrict, String regionCity);


	Member getMemberByToken(String token);
}

