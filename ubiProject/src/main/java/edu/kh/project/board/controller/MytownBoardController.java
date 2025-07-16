package edu.kh.project.board.controller;

import java.util.Arrays;
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
	public ResponseEntity<?> getBoards(
	    @RequestParam(name = "page") int page,
	    @RequestParam(name = "postType", required = false) String postType,
	    @RequestParam(name = "regionCity", required = false) String regionCity,
	    @RequestParam(name = "regionDistrict", required = false) String regionDistrict,
	    @RequestParam(name = "keyword", required = false) String keyword,
	    @RequestParam(name = "tags", required = false) String tags
	) {
	    Map<String, Object> paramMap = new HashMap<>();
	    paramMap.put("postType", postType);
	    paramMap.put("regionCity", regionCity);
	    paramMap.put("regionDistrict", regionDistrict);
	    paramMap.put("keyword", keyword);
	    paramMap.put("tagList", tags != null && !tags.isEmpty() ? List.of(tags.split(",")) : null);

	    // 게시글 개수 조회
	    int listCount = service.getFilteredBoardCount(paramMap);

	    // 페이지네이션 객체 생성
	    Pagination pagination = new Pagination(page, listCount);
	    paramMap.put("startRow", (pagination.getCurrentPage() - 1) * pagination.getLimit());
	    paramMap.put("limit", pagination.getLimit());

	    // 게시글 목록 조회
	    List<Board> boardList = service.getFilteredBoardList(paramMap);

	    return ResponseEntity.ok(Map.of(
	        "boardList", boardList,
	        "pagination", pagination
	    ));
	}





	@GetMapping("/mytownBoard/{boardNo}")
	public ResponseEntity<Board> getLocalBoardDetail(
	        @PathVariable("boardNo") int boardNo,
	        @RequestHeader(value = "Authorization", required = false) String authHeader) {

	    Long memberNo = null;

	    if (authHeader != null && authHeader.startsWith("Bearer ")) {
	        try {
	            String token = authHeader.substring(7); // "Bearer " 제거
	            memberNo = jwtUtil.extractMemberNo(token); // ✅ Long 타입 반환
	        } catch (Exception e) {
	            System.out.println("⚠️ JWT 파싱 실패: " + e.getMessage());
	            // memberNo는 null로 둠 → 비회원 처리
	        }
	    }

	    Board board = service.selectLocalBoardDetail(boardNo, memberNo != null ? memberNo.intValue() : null);

	    if (board != null && memberNo != null) {
	        int likeCheck = service.checkBoardLike(boardNo, memberNo.intValue());
	        board.setLikeCheck(likeCheck);
	        String reportStatus = service.checkBoardReportStatus(boardNo, memberNo.intValue());
	        board.setReportedByMe(reportStatus);
	    } else if (board != null) {
	        board.setLikeCheck(0);
	    }

	    return board != null
	        ? ResponseEntity.ok(board)
	        : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
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
	
	
	@GetMapping("/mytownBoard/facility/{facilityServiceId}")
	public List<Board> getPostsByFacility(@PathVariable("facilityServiceId") String facilityServiceId) {
	    return service.getBoardListByFacilityServiceId(facilityServiceId);
	}
	
	@GetMapping("/mytownBoard/welfare/{apiServiceId}")
	public List<Board> getPostsByWelfare(@PathVariable("apiServiceId") String apiServiceId) {
	    return service.getBoardListByWelfareServiceId(apiServiceId);
	}

}
