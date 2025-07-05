package edu.kh.project.board.model.service;

import java.util.List;

import edu.kh.project.board.model.dto.Comment;

public interface CommentService {

	/** 댓글 목록 조회 서비스
	 * @param boardNo
	 * @return
	 */
	List<Comment> select(int boardNo);

	/** 댓글/답글 작성 서비스
	 * @param comment
	 * @return
	 */
	int insert(Comment comment);

	/** 댓글 삭제 서비스
	 * @param commentNo
	 * @return
	 */
	int delete(int commentNo);

	/** 댓글 수정 서비스
	 * @param comment
	 * @return
	 */
	int update(Comment comment);
	
	/** 좋아요 서비스
	 * @param commentNo
	 * @param memberNo
	 * @return
	 */
	boolean toggleCommentLike(int commentNo, int memberNo);

	/** 만약 보드에 관리자 답이 달렸으면 답변 변경 메서드 
	 * @param boardNo
	 * @param string
	 */
	void updateBoardAnswer(int boardNo, String boardAnswer);

	/** 댓글 신고하는 기능
	 * @param commentNo
	 * @param memberNo
	 * @return
	 */
	boolean reportComment(int commentNo, int memberNo);

}
