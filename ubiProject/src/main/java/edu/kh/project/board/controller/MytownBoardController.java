package edu.kh.project.board.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.board.model.service.MytownBoardService;
import edu.kh.project.common.util.JwtUtil;

@RestController
@RequestMapping("/api/board")

public class MytownBoardController {

	@Autowired
	private MytownBoardService service;

	@Autowired
	private JwtUtil jwtUtil;

	@GetMapping("/mytownBoard")
	public ResponseEntity<Map<String, Object>> getLocalBoardList(
			@RequestParam(value = "page", required = false, defaultValue = "1") int page) {

		List<Board> boardList = service.getLocalBoardList(page);
		Pagination pagination = service.getPagination(page);

		return ResponseEntity.ok().body(Map.of("boardList", boardList, "pagination", pagination));
	}

	@GetMapping("/mytownBoard/{boardNo}")
	public ResponseEntity<Board> getLocalBoardDetail(@PathVariable("boardNo") int boardNo,
			@RequestParam(value = "memberNo", required = false) Integer memberNo) {

		// ✅ 게시글 상세조회
		Board board = service.selectLocalBoardDetail(boardNo, memberNo);

		if (board != null && memberNo != null) {
			int likeCheck = service.checkBoardLike(boardNo, memberNo); // 1 or 0
			board.setLikeCheck(likeCheck);
			String reportStatus = service.checkBoardReportStatus(boardNo, memberNo); // "Y" or "N" or null
			board.setReportedByMe(reportStatus);
		} else if (board != null) {
			board.setLikeCheck(0); // 비회원 등
		}

		return board != null ? ResponseEntity.ok(board) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	}

	@PostMapping("/mytownBoard/{boardNo}/like")
	public ResponseEntity<?> toggleBoardLike(@PathVariable("boardNo") int boardNo,
			@RequestParam("memberNo") int memberNo, @RequestParam("writerNo") int writerNo) {

		// 본인 글인지 확인
		if (memberNo == writerNo) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("본인의 글에는 좋아요를 누를 수 없습니다.");
		}

		int liked = service.checkBoardLike(boardNo, memberNo);

		if (liked > 0) {
			service.deleteBoardLike(boardNo, memberNo);
			return ResponseEntity.ok("unliked");
		} else {
			service.insertBoardLike(boardNo, memberNo);
			return ResponseEntity.ok("liked");
		}
	}

	/**
	 * 신고하기
	 * 
	 * @param commentNo
	 * @param authHeader
	 * @return
	 */
	@PostMapping("/mytownBoard/{boardNo}/report")
	public ResponseEntity<Map<String, Object>> reportComment(@PathVariable("boardNo") int boardNo,
			@RequestHeader("Authorization") String authHeader) {

		Map<String, Object> result = new HashMap<>();

		try {
			String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
			int memberNo = jwtUtil.extractMemberNo(token).intValue();

			boolean reported = service.reportBoard(boardNo, memberNo);
			result.put("reported", reported);

			return ResponseEntity.ok(result);

		} catch (Exception e) {
			result.put("error", "신고 처리 중 오류 발생");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
		}
	}

}
