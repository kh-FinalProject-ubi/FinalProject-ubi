package edu.kh.project.board.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.board.model.mapper.CommentMapper;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class CommentServiceImpl implements CommentService {

	@Autowired
	private CommentMapper mapper;

	// 댓글 목록 조회 서비스
	@Override
	public List<Comment> select(int boardNo) {
		return mapper.select(boardNo);
	}

	// 댓글/답글 등록 서비스
	@Override
	public int insert(Comment comment) {
		return mapper.insert(comment);
	}

	// 댓글 삭제 기능 + 관리자 댓글 확인 후에 0인 경우 boardAnswer N을 바꾸는 메서드
	@Override
	public int delete(int commentNo) {
		// 1. 댓글 정보 가져오기
		Comment comment = mapper.selectCommentNo(commentNo);
		if (comment == null)
			return 0;

		int boardNo = comment.getBoardNo();

		// 2. 댓글 삭제
		int result = mapper.delete(commentNo);

		// 3. 해당 게시글에 남은 관리자 댓글 수 조회
		int adminCommentCount = mapper.countAdminComments(boardNo);

		// 4. 관리자 댓글이 0개면 답변 상태를 N으로 업데이트
		if (adminCommentCount == 0) {
			mapper.updateBoardAnswer(boardNo, "N");
		}

		return result;
	}

	// 댓글 수정 서비스
	@Override
	public int update(Comment comment) {
		return mapper.update(comment);
	}

	// 좋아요 토글 서비스
	@Override
	public boolean toggleCommentLike(int commentNo, int memberNo) {
		// 좋아요 여부 확인
		int count = mapper.checkCommentLike(commentNo, memberNo);

		if (count > 0) {
			// 이미 눌렀음 → 삭제
			mapper.deleteCommentLike(commentNo, memberNo);
			return false; // 좋아요 취소
		} else {
			// 없으면 추가
			mapper.insertCommentLike(commentNo, memberNo);
			return true; // 좋아요 추가
		}
	}

	// 답변 답한 경우 update 답변
	@Override
	public void updateBoardAnswer(int boardNo, String boardAnswer) {
		mapper.updateBoardAnswer(boardNo, boardAnswer);
	}

	// 신고하고 신고 취소하는 메서드
	@Override
	public boolean reportComment(int commentNo, int memberNo) {
		Integer targetMemberNo = mapper.selectCommentWriterNo(commentNo);

		if (targetMemberNo == null)
			return false;

		int count = mapper.checkCommentReportCount(commentNo, memberNo);

		if (count > 0) {
			// 신고 취소 처리
			mapper.deleteCommentReport(commentNo, memberNo); // UPDATE REPORT SET STATUS='N'
			mapper.decreaseCommentReportCount(commentNo); // -1
			return false;
		} else {
			// 신고 등록

			Map<String, Object> paramMap = new HashMap<>();
			paramMap.put("commentNo", commentNo);
			paramMap.put("memberNo", memberNo); // 신고자
			paramMap.put("targetMemberNo", targetMemberNo); // 신고 당한 사람

			int result = mapper.insertCommentReport(paramMap);
			System.out.println(">>> insertCommentReport 결과: " + result);
	        mapper.updateCommentReportCount(commentNo);
	        return true;
		}
	}

}
