package edu.kh.project.board.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.board.model.mapper.BoardMapper;
import edu.kh.project.board.model.mapper.CommentMapper;
import edu.kh.project.board.model.mapper.MytownBoardMapper;
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.websocket.service.AlertService;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class CommentServiceImpl implements CommentService {

	@Autowired
	private SimpMessagingTemplate messagingTemplate; // WebSocket 메시지 전송

	@Autowired
	private BoardMapper boardMapper; // 게시글 작성자 번호 조회용 (필요 시 생성)
	
	@Autowired
	private AlertService alertService; // ✅ 이 줄 추가

	@Autowired
	private MytownBoardMapper myTownBoardMapper;

	@Autowired
	private CommentMapper mapper;

	// 맴버 메퍼
	@Autowired
	private MemberMapper memberMapper;

	// 댓글 목록 조회 서비스
	@Override
	public List<Comment> select(int boardNo, int memberNo) {
		return mapper.select(boardNo, memberNo);
	}

	// 댓글/답글 등록 서비스
	@Override
	public int insert(Comment comment) {
	    int result = mapper.insert(comment);

	    if (result > 0) {
	        Integer writerNo = boardMapper.selectWriterNo(comment.getBoardNo());
	        Integer boardType = boardMapper.selectBoardType(comment.getBoardNo());
	        boolean isInquiryBoard = (boardType != null && boardType == 2);
	        Integer authority = memberMapper.selectMemberAuthority(comment.getMemberNo());
	        boolean isAdmin = (authority != null && authority == 2);

	        if (writerNo != null && !writerNo.equals(comment.getMemberNo())) {
	            if (isInquiryBoard && isAdmin) {
	                // 문의 답변 알림
	                alertService.sendAlert(
	                    writerNo.longValue(),
	                    "문의에 답변이 등록되었습니다.",
	                    "/askBoard/" + comment.getBoardNo(),
	                    comment.getBoardNo(),
	                    "QUESTION_REPLY"
	                );
	            } else {
	                // 일반 댓글 알림
	                alertService.sendAlert(
	                    writerNo.longValue(),
	                    "내 글에 댓글이 달렸습니다.",
	                    "/mytownBoard/" + comment.getBoardNo(),
	                    comment.getBoardNo(),
	                    "COMMENT"
	                );
	            }
	        }
	    }

	    return result;
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

		String reportStatus = mapper.checkCommentReportCount(commentNo, memberNo);

		int beforeReportCount = mapper.selectCommentReportTotalCount(commentNo);

		try {
			if (reportStatus == null) {
				// 최초 신고
				Map<String, Object> paramMap = new HashMap<>();
				paramMap.put("commentNo", commentNo);
				paramMap.put("memberNo", memberNo);
				paramMap.put("targetMemberNo", targetMemberNo);
				int result = mapper.insertCommentReport(paramMap);
				System.out.println("insertCommentReport result: " + result);
				mapper.updateCommentReportCount(commentNo);

				int afterReportCount = mapper.selectCommentReportTotalCount(commentNo);

				if (afterReportCount % 3 == 0) {
					memberMapper.updateMemberReportCount(targetMemberNo, +1);

					int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);

					Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

					if (memberReportCount % 5 == 0) {
						LocalDateTime now = LocalDateTime.now();
						if (suspension == null) {
							// 신규 정지 등록 (5의 배수일 때)
							LocalDateTime end = now.plusMinutes(5);
							memberMapper.insertSuspensionTest(targetMemberNo, now, end);
						} else {
							// 정지 중이면 정지 기간 연장
							LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
							LocalDateTime end = originEnd.plusMinutes(5); // 연장 기간 설정
							memberMapper.extendSuspensionEnd(targetMemberNo, end);
						}

						// ▶ 회원 정지 발생 시 신고당한 댓글 삭제 처리
						List<Integer> reportedCommentNos = mapper.selectAllReportComments(targetMemberNo);
						for (int cno : reportedCommentNos) {
							mapper.delete(cno);
						}

						// ▶ 신고당한 게시글도 같이 삭제 처리
						List<Integer> reportedBoardNos = myTownBoardMapper.selectAllReportBoards(targetMemberNo);
						for (int bno : reportedBoardNos) {
							Integer boardWriterNo = myTownBoardMapper.selectBoardWriterNo(bno);
							if (boardWriterNo != null) {
								myTownBoardMapper.deleteBoard(bno, boardWriterNo);
							}
						}
					}
				}
				return true;

			} else if ("Y".equals(reportStatus)) {
				// 신고 취소
				mapper.deleteCommentReport(commentNo, memberNo);
				mapper.decreaseCommentReportCount(commentNo);

				int afterReportCount = mapper.selectCommentReportTotalCount(commentNo);

				if (beforeReportCount % 3 == 0 && afterReportCount % 3 == 2) {
					memberMapper.updateMemberReportCount(targetMemberNo, -1);

					int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);

					// 정지 상태 조회
					Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

					// 신고 카운트가 5 미만이고 정지 상태면 해제
					if (memberReportCount < 5 && suspension != null) {
						memberMapper.deleteSuspension(targetMemberNo);

						// ▶ 신고 취소 및 정지 해제 시 댓글 복구 (단, 정지 기록이 존재할 때만)
						List<Integer> reportedCommentNos = mapper.selectAllReportComments(targetMemberNo);
						for (int cno : reportedCommentNos) {
							mapper.recover(cno);
						}

						// ▶ 게시글도 같이 복구 처리
						List<Integer> reportedBoards = myTownBoardMapper.selectAllReportBoards(targetMemberNo);
						for (int bno : reportedBoards) {
							myTownBoardMapper.recoverBoard(bno);
						}
					}
				}
				return false;

			} else if ("N".equals(reportStatus)) {
				// 신고 재활성화
				mapper.reactivateCommentReport(commentNo, memberNo);
				mapper.updateCommentReportCount(commentNo);

				int afterReportCount = mapper.selectCommentReportTotalCount(commentNo);

				if (afterReportCount % 3 == 0) {
					memberMapper.updateMemberReportCount(targetMemberNo, +1);

					int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);
					Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

					if (memberReportCount % 5 == 0) {
						LocalDateTime now = LocalDateTime.now();

						if (suspension == null) {
							LocalDateTime end = now.plusMinutes(5);
							memberMapper.insertSuspensionTest(targetMemberNo, now, end);
						} else {
							LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
							LocalDateTime end = originEnd.plusMinutes(5);
							memberMapper.extendSuspensionEnd(targetMemberNo, end);
						}

						// ▶ 신고 누적으로 인한 정지 시 댓글 및 게시글 삭제 처리
						List<Integer> reportedCommentNos = mapper.selectAllReportComments(targetMemberNo);
						for (int cno : reportedCommentNos) {
							mapper.delete(cno);
						}

						List<Integer> reportedBoardNos = myTownBoardMapper.selectAllReportBoards(targetMemberNo);
						for (int bno : reportedBoardNos) {
							Integer boardWriterNo = myTownBoardMapper.selectBoardWriterNo(bno);
							if (boardWriterNo != null) {
								myTownBoardMapper.deleteBoard(bno, boardWriterNo);
							}
						}
					}
				}
				return true;
			}

		} catch (Exception e) {
			System.out.println("⛔ reportComment 트랜잭션 처리 중 예외 발생!");
			e.printStackTrace();
			throw e;
		}

		return false;

	}

}
