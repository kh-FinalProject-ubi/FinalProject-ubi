package edu.kh.project.board.model.service;

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

			log.info("💬 댓글 작성자: {}", comment.getMemberNo()); // 댓글 작성자
			log.info("📝 게시글 작성자: {}", writerNo); // 게시글 작성자
			log.info("⚖️ 동일인 여부: {}", writerNo != null && writerNo.equals(comment.getMemberNo())); // 비교

			if (writerNo != null && !writerNo.equals(comment.getMemberNo())) {
				AlertDto alert = AlertDto.builder().alertId(null) // 보통 null로 생성 (DB 저장 시 자동 생성)
						.memberNo(writerNo != null ? writerNo.longValue() : null) // Integer → Long 변환
						.type(AlertType.COMMENT).content("회원님의 게시글에 댓글이 달렸습니다.")
						.targetUrl("/free/detail/" + comment.getBoardNo())
						.createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
						.isRead(false).build();

				log.info("📤 알림 전송 → /topic/alert/{}", writerNo); // ★ 여기가 핵심

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
		// 1. 댓글 작성자 찾기
		Integer targetMemberNo = mapper.selectCommentWriterNo(commentNo);
		if (targetMemberNo == null)
			return false;

		// 2. 신고 상태 조회
		String reportStatus = mapper.checkCommentReportCount(commentNo, memberNo);
		int beforeReportCount = mapper.selectCommentReportTotalCount(commentNo); // 총 신고 수 (기존 상태)

		if (reportStatus == null) {
			// 3. 최초 신고
			Map<String, Object> paramMap = new HashMap<>();
			paramMap.put("commentNo", commentNo);
			paramMap.put("memberNo", memberNo);
			paramMap.put("targetMemberNo", targetMemberNo);
			mapper.insertCommentReport(paramMap);
			mapper.updateCommentReportCount(commentNo);

			int afterReportCount = beforeReportCount + 1;

			// 3의 배수 도달 시 REPORT_COUNT +1
			if (afterReportCount % 3 == 0) {
				int result = memberMapper.updateMemberReportCount(targetMemberNo, +1);
				System.out.println("report +1 result: " + result);

				// REPORT_COUNT == 5 → 정지 5분
				int memberReportCount = memberMapper.selectReportCount(targetMemberNo);
				if (memberReportCount == 5) {
					LocalDateTime now = LocalDateTime.now();
					LocalDateTime end = now.plusMinutes(5);
					memberMapper.insertSuspensionTest(targetMemberNo, now, end);
					System.out.println("정지 5분 적용됨");
				}
			}

			return true;

		} else if ("Y".equals(reportStatus)) {
			// 4. 신고 취소
			mapper.deleteCommentReport(commentNo, memberNo);
			mapper.decreaseCommentReportCount(commentNo);

			int afterReportCount = beforeReportCount - 1;

			// 3의 배수였다가 1 빠지면 REPORT_COUNT -1
			if (beforeReportCount % 3 == 0 && afterReportCount % 3 == 2) {
				int result = memberMapper.updateMemberReportCount(targetMemberNo, -1);
				System.out.println("report -1 result: " + result);

				// REPORT_COUNT == 4 → 정지 해제
				int memberReportCount = memberMapper.selectReportCount(targetMemberNo);
				if (memberReportCount == 4) {
					memberMapper.deleteSuspension(targetMemberNo);
					System.out.println("정지 해제됨");
				}
			}

			return false;

		} else if ("N".equals(reportStatus)) {
			// 5. 다시 신고 활성화
			mapper.reactivateCommentReport(commentNo, memberNo);
			mapper.updateCommentReportCount(commentNo);

			int afterReportCount = beforeReportCount + 1;

			// 3의 배수 도달 시 REPORT_COUNT +1
			if (afterReportCount % 3 == 0) {
				int result = memberMapper.updateMemberReportCount(targetMemberNo, +1);
				System.out.println("report +1 result: " + result);

				// REPORT_COUNT == 5 → 정지
				int memberReportCount = memberMapper.selectReportCount(targetMemberNo);
				if (memberReportCount == 5) {
					LocalDateTime now = LocalDateTime.now();
					LocalDateTime end = now.plusMinutes(5);
					memberMapper.insertSuspensionTest(targetMemberNo, now, end);
					System.out.println("정지 5분 적용됨");
				}
			}

			return true;
		}

		return false;
	}

}
