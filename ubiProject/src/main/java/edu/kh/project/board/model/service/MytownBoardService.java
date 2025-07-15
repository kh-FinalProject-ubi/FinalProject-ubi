package edu.kh.project.board.model.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.member.model.dto.Member;

public interface MytownBoardService {

	/**
	 * 작성자의 게시글 목록조회
	 * 
	 * @param regionDistrict
	 * @param i
	 * @return
	 */
	//List<Board> getLocalBoardList(int page);
	
//	// 전체 게시글 수
//	int getBoardLocalListCount();
//
//	// 일반 조회 (RowBounds 사용)
//	List<Board> getLocalBoardList(Pagination pagination);
//
//	// 검색 필터 조회용
//	int getFilteredBoardCount(Map<String, Object> paramMap);
//	List<Board> getFilteredBoardList(Map<String, Object> paramMap);
	int getFilteredBoardCount(Map<String, Object> paramMap);
	List<Board> getFilteredBoardList(Map<String, Object> paramMap);


	/**
	 * 상세조회
	 * 
	 * @param boardNo
	 * @return
	 */
	Board selectLocalBoardDetail(int boardNo, int memberNo);

	/**
	 * 글쓰기
	 * 
	 * @param dto
	 * @return
	 */
	int writeBoard(Board dto);

	void insertHashtag(int boardNo, String tag);

	String saveBoardImage(MultipartFile uploadFile) throws IOException;

	/**
	 * 좋아요
	 * 
	 * @param boardNo
	 * @param memberNo
	 * @return
	 */

	// 좋아요 여부 확인
	int checkBoardLike(int boardNo, int memberNo);

	// 좋아요 등록
	int insertBoardLike(int boardNo, int memberNo);

	// 좋아요 취소
	int deleteBoardLike(int boardNo, int memberNo);

	/**
	 * 삭제
	 * 
	 * @param boardNo
	 * @param memberNo
	 * @return
	 */
	int deleteBoard(int boardNo, int memberNo);

	/**
	 * 수정
	 * 
	 * @param dto
	 * @return
	 */
	int updateBoard(Board dto);
	
	int getBoardWriterNo(int boardNo);
	
	/** 신고
	 * @param boardNO
	 * @param memberNo
	 * @return
	 */
	boolean reportBoard(int boardNO, int memberNo);

	String checkBoardReportStatus(int boardNo, int memberNo);

	/** 복지 상세조회에서 후기 조회
	 * 
	 * @param serviceId
	 * @return
	 */
	List<Board> getBoardListByFacilityServiceId(String facilityServiceId);

	List<Board> getBoardListByWelfareServiceId(String apiServiceId);
	

	/**
	 * 이미지
	 * 
	 * @param boardNo
	 * @return
	 */
//	    int deleteImagesByBoardNo(int boardNo); // 이미지 삭제용
//	    int insertBoardImage(BoardImage image); // 이미지 삽입용
//	    
}
