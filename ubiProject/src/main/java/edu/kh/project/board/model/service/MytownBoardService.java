package edu.kh.project.board.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.project.board.model.dto.Board;

public interface MytownBoardService {
	/** 게시판 종류 조회 서비스(Intercertor)
	 * @return 삭제 ?? 
	 */
	List<Map<String, Object>> selectMytownBoardTypeList();

	/** 특정 게시판의 지정된 페이지 목록 조회
	 * @param cp
	 * @return
	 */
	Map<String, Object> selectMytownBoardList(int boardCode, int cp, Map<String, Object> paramMap);

	/** 게시글 상세 조회 서비스
	 * @param map
	 * @return cp
	 */
	Board selectMytownOne(Map<String, Integer> map);

	/** 게시글 좋아요 체크/해제
	 * @param map
	 * @return
	 */
	int MytownboardLike(Map<String, Integer> map);

	/** 조회수 1 증가 서비스
	 * @param boardNo
	 * @return
	 */
	int updateMytownReadCount(int boardNo);

	/** 검색 서비스
	 * @param paramMap
	 * @param cp
	 * @return
	 */
	Map<String, Object>  searchMytownList(Map<String, Object> paramMap, int cp);

	/** DB 이미지 파일명 목록 조회
	 * @return
	 */
	List<String> selectDBImageList();

	

}

