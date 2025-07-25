package edu.kh.project.board.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.service.annotation.PutExchange;

import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.board.model.service.CommentService;
import edu.kh.project.common.util.JwtUtil;

/* @RestController (REST API구축을 위해서 사용하는 컨트롤러용 어노테이션)
 * 
 * ==> @Controller (요청/응답 제어 역할 명시 + bean으로 등록)
 * + @ResponseBody (응답 본문으로 응답 데이터 자체를 반환)
 * 
 * -> 모든 요청에 대한 응답을 응답 본문으로 반환하는 컨트롤러
 * 		(비동기 요청에 대한 컨트롤러)
 * 
 * */

//@Controller
/**
 * 
 */
/**
 * 
 */
@RestController
@RequestMapping("/api/comments")
//@RequiredArgsConstructor + 메서드 안에 final => @Autowired 기능 
public class CommentController {

	@Autowired
	private CommentService service;

	@Autowired
	private JwtUtil jwtUtil;

	/**
	 * 댓글 목록 조회
	 * 
	 * @param boardNo
	 * @return
	 */
	@GetMapping("/{boardCode}/{boardNo}")
	public List<Comment> select(
	    @PathVariable("boardCode") int boardCode,
	    @PathVariable("boardNo") int boardNo,
	    @RequestHeader(value = "Authorization", required = false) String authHeader) {

	    int memberNo = 0; // 비로그인 사용자 기본값

	    if (authHeader != null && authHeader.startsWith("Bearer ")) {
	        String token = authHeader.substring(7);
	        memberNo = jwtUtil.extractMemberNo(token).intValue();
	    }

	    return service.select(boardNo, memberNo);
	}

	@PostMapping("/{boardCode}/{boardNo}")
	public int insert(@PathVariable("boardCode") int boardCode, @PathVariable("boardNo") int boardNo,
			@RequestBody Comment comment, @RequestHeader("Authorization") String authHeader) {

		String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
		Long memberNoLong = jwtUtil.extractMemberNo(token);
		int memberNo = memberNoLong.intValue();

		comment.setBoardNo(boardNo);
		comment.setMemberNo(memberNo);

		// 댓글 등록
		int result = service.insert(comment);

		// 관리자면 답변 상태 업데이트
		String authority = jwtUtil.extractRole(token); // "ADMIN" / "USER" 등
		if (boardCode == 2 && "ADMIN".equals(authority)) {
			service.updateBoardAnswer(boardNo, "Y");
		}

		return result;
	}

	/**
	 * 댓글 삭제
	 * 
	 * @param commentNo
	 * @return
	 */
	@DeleteMapping("/{commentNo}")
	public int delete(@PathVariable("commentNo") int commentNo) {
		return service.delete(commentNo);
	}

	/**
	 * 댓글 수정
	 * 
	 * @param comment
	 * @return
	 */
	@PutMapping("/{commentNo}")
	public int update(@RequestBody Comment comment) {
		return service.update(comment);
	}

	/**
	 * 댓글 좋아요
	 * 
	 * @param commentNo
	 * @param authHeader
	 * @return
	 */
	@PostMapping("/{commentNo}/like")
	public ResponseEntity<Map<String, Object>> toggleCommentLike(@PathVariable("commentNo") int commentNo,
			@RequestHeader("Authorization") String authHeader) {

		String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
		int memberNo = jwtUtil.extractMemberNo(token).intValue();

		boolean liked = service.toggleCommentLike(commentNo, memberNo);

		Map<String, Object> result = new HashMap<>();
		result.put("liked", liked); // true 또는 false

		return ResponseEntity.ok(result);
	}

	/**
	 * 신고하기
	 * 
	 * @param commentNo
	 * @param authHeader
	 * @return
	 */
	@PostMapping("/{commentNo}/report")
	public ResponseEntity<Map<String, Object>> reportComment(@PathVariable("commentNo") int commentNo,
			@RequestHeader("Authorization") String authHeader) {

		Map<String, Object> result = new HashMap<>();

		try {
			String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
			int memberNo = jwtUtil.extractMemberNo(token).intValue();

			boolean reported = service.reportComment(commentNo, memberNo);
			result.put("reported", reported);
			
			return ResponseEntity.ok(result);

		} catch (Exception e) {
			result.put("error", "신고 처리 중 오류 발생");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
		}
	}
}
