package edu.kh.project.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.session.RowBounds;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.member.model.dto.Member;

/**
 * 
 */
@Mapper
public interface MytownBoardMapper {

	/**
	 * 시군구가 동일한 게시글 목록 조회
	 * 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	List<Board> selectLocalBoardList(RowBounds rowBounds);

	int getBoardLocalListCount();

	/**
	 * 상세조회
	 * 
	 * @param boardNo
	 * @return
	 */
	Board selectLocalBoardDetail(@Param("boardNo") int boardNo, @Param("reporterNo") int memberNo);

	/**
	 * 조회수 증가
	 * 
	 * @param boardNo
	 * @return
	 */
	int increaseReadCount(int boardNo);

	// 게시글 작성
	int insertBoard(Board dto);

	int getLastInsertedId();

	/**
	 * 해시태그
	 * 
	 * @param boardNo
	 * @param tag
	 */
	void insertHashtag(@Param("boardNo") int boardNo, @Param("tag") String tag);

	void deleteHashtags(int boardNo);

	int checkHashtagExists(@Param("boardNo") int boardNo, @Param("tag") String tag);

	// 게시글 이미지
	int insertBoardImage(BoardImage img);

	List<BoardImage> selectBoardImageList(int boardNo);

	// 이미지 정제 추후 삭제
	List<BoardImage> selectAllImages();

	int updateImagePath(@Param("imageNo") int imageNo, @Param("imagePath") String imagePath);

	// 좋아요 확인
	int checkBoardLike(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	// 좋아요 등록
	int insertBoardLike(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	// 좋아요 취소
	int deleteBoardLike(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	/**
	 * 게시글 삭제
	 * 
	 * @param boardNo
	 * @param memberNo
	 * @return
	 */
	int deleteBoard(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	/**
	 * 수정하기
	 * 
	 * @param dto
	 * @return
	 */
	int updateBoard(Board dto);

	/**
	 * 이미지 처리
	 * 
	 * @param boardNo
	 * @return
	 */
	int deleteImagesByBoardNo(int boardNo);

	int insertBoardImage1(BoardImage image);
	
	
	
	// 복지시설 존재 여부
    int existsFacilityById(String id);

    // 복지혜택 존재 여부
    int existsWelfareById(String id);

    // 복지시설 INSERT (게시글 작성 시 최초 저장)
    int insertFacilityFromBoard(Board dto);

    // 복지혜택 INSERT (게시글 작성 시 최초 저장)
    int insertWelfareFromBoard(Board dto);
	

	// 신고를 위한 메서드 목록

	// 신고 테이블에서 모든 게시판 신고 확인
	List<Integer> selectAllReportBoards(Integer targetMemberNo);

	// 게시글 신고 횟수 세기
	int selectBoardReportTotalCount(int boardNo);

	// BOARD 테이블의 신고 수 +1
	void updateBoardReportCount(int boardNo);

	// 신고 테이블에서 보드 신고 재활성화
	void reactivateBoardReport(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	// 삭제한 보드 복구 메서드
	void recoverBoard(int boardNo);

	// 보드 테이블에서 신고 횟수 줄이기
	void decreaseBoardReportCount(int boardNo);

	// 신고 테이블에서 보드 신고 삭제하기
	void deleteBoardReport(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	// 신고테이블에 보드 신고 넣기
	int insertBoardReport(Map<String, Object> paramMap);

	// 보드 신고 횟수 세기
	String checkBoardReportCount(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	// 신고당할 보드 작성자 측정하기
	Integer selectBoardWriterNo(int boardNo);

	// 해당 게시글에서 이 회원이 이 게시글을 신고했어?
	String selectReportStatus(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	List<Board> selectBoardListByFacilityServiceId(String facilityServiceId);

}