package edu.kh.project.board.model.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.websocket.dto.AlertDto;
import edu.kh.project.websocket.type.AlertType;
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
			// 게시글 작성자 번호 조회 (예: boardMapper에서)
			Integer writerNo = boardMapper.selectWriterNo(comment.getBoardNo());

			if (writerNo != null && !writerNo.equals(comment.getMemberNo())) {
				AlertDto alert = AlertDto.builder().alertId(null) // 보통 null로 생성 (DB 저장 시 자동 생성)
						.memberNo(writerNo != null ? writerNo.longValue() : null) // Integer → Long 변환
						.type(AlertType.COMMENT).content("회원님의 게시글에 댓글이 달렸습니다.")
						.targetUrl("/free/detail/" + comment.getBoardNo())
						.createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
						.isRead(false).build();

				messagingTemplate.convertAndSend("/topic/alert/" + writerNo, alert);
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
	    if (targetMemberNo == null) return false;

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
	                System.out.println("memberReportCount 값: " + memberReportCount);

	                if (memberReportCount == 5) {
	                    LocalDateTime now = LocalDateTime.now();
	                    LocalDateTime plus5min = now.plusMinutes(5);
	                    try {
	                        memberMapper.insertSuspensionTest(targetMemberNo, now, plus5min);
	                    } catch (Exception e) {
	                        System.out.println("⛔ 정지 등록 중 예외 발생");
	                        e.printStackTrace();
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
	                if (memberReportCount == 4) {
	                    try {
	                    	int result = memberMapper.deleteSuspension(27);
	                    	System.out.println("삭제 결과: " + result);
	                    } catch (Exception e) {
	                        System.out.println("⛔ 정지 해제 중 예외 발생");
	                        e.printStackTrace();
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
	                System.out.println("memberReportCount 값: " + memberReportCount);
	                if (memberReportCount == 5) {
	                    LocalDateTime now = LocalDateTime.now();
	                    LocalDateTime plus5min = now.plusMinutes(5);
	                    try {
	                        memberMapper.insertSuspensionTest(targetMemberNo, now, plus5min);
	                    } catch (Exception e) {
	                        System.out.println("⛔ 정지 등록 중 예외 발생 (재신고)");
	                        e.printStackTrace();
	                    }
	                }
	            }

	            return true;
	        }

	    } catch (Exception e) {
	        System.out.println("⛔ reportComment 트랜잭션 처리 중 예외 발생!");
	        e.printStackTrace();
	        throw e; // 또는 return false; (실패 처리를 프론트에 알려주고 싶으면)
	    }

	    return false;
	}


}
