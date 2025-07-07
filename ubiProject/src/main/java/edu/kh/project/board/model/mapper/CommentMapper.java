package edu.kh.project.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.project.board.model.dto.Comment;

@Mapper
public interface CommentMapper {

	/**
	 * 댓글 목록 조회
	 * 
	 * @param boardNo
	 * @return
	 */
	List<Comment> select(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	/**
	 * 댓글/답글 작성
	 * 
	 * @param comment
	 * @return
	 */
	int insert(Comment comment);

	/**
	 * 댓글 삭제 서비스
	 * 
	 * @param commentNo
	 * @return
	 */
	int delete(int commentNo);

	/**
	 * 댓글 수정 서비스
	 * 
	 * @param comment
	 * @return
	 */
	int update(Comment comment);

	// 댓글 좋아요 메서드
	int checkCommentLike(@Param("commentNo") int commentNo, @Param("memberNo") int memberNo);

	void insertCommentLike(@Param("commentNo") int commentNo, @Param("memberNo") int memberNo);

	void deleteCommentLike(@Param("commentNo") int commentNo, @Param("memberNo") int memberNo);

	/**
	 * 답변 여부
	 * 
	 * @param boardNo
	 * @param boardAnswer
	 */
	void updateBoardAnswer(@Param("boardNo") int boardNo, @Param("boardAnswer") String boardAnswer);

	/**
	 * 삭제 전에 코멘트 정보 얻어오는 메서드
	 * 
	 * @param commentNo
	 * @return
	 */
	Comment selectCommentNo(int commentNo);

	/**
	 * 삭제 뒤에 관리자 코멘트 여부 확인
	 * 
	 * @param boardNo
	 * @return
	 */
	int countAdminComments(int boardNo);


	// 해당 댓글 전체 상태 확인 (y,n)
	String checkCommentReportCount(@Param("commentNo") int commentNo, @Param("memberNo") int memberNo);
	
	// Report 테이블에서 댓글신고 삭제 
	void deleteCommentReport(@Param("commentNo") int commentNo, @Param("memberNo") int memberNo);
	
	// Comments 테이블의 댓글 신고 횟수 -1 하기
	void decreaseCommentReportCount(int commentNo);
	
	// Report 테이블에서 댓글신고 추가 
	int insertCommentReport(Map<String, Object> paramMap);
	
	// Comments 테이블의 댓글 신고 횟수 +1 하기
	void updateCommentReportCount(int commentNo);

	// 신고 당해야 하는 댓글 작성자 번호 구해오는 메서드
	Integer selectCommentWriterNo(int commentNo);

	// 재신고 로직
	void reactivateCommentReport(@Param("commentNo") int commentNo, @Param("memberNo") int memberNo);

	// 이 댓글은 몇 번 신고당한 거야?
	int selectCommentReportTotalCount(int commentNo);


}
