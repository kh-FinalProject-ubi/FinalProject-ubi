package edu.kh.project.board.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
@RestController  
@RequestMapping("/api/comments")
//@RequiredArgsConstructor + 메서드 안에 final => @Autowired 기능 
public class CommentController {

	@Autowired
	private CommentService service;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	/** 댓글 목록 조회
	 * @param boardNo
	 * @return 
	 */
	@GetMapping("/{boardCode}/{boardNo}")
	public List<Comment> select(
	    @PathVariable("boardCode") int boardCode,
	    @PathVariable("boardNo") int boardNo) {

	    return service.select(boardNo); 
	}
	
	/** 댓글/답글 등록
	 * @return
	 */
	@PostMapping("/{boardCode}/{boardNo}/insert")
	public int insert(
	    @PathVariable("boardCode") int boardCode,
	    @PathVariable("boardNo") int boardNo,
	    @RequestBody Comment comment,
	    @RequestHeader("Authorization") String authHeader
	    ) {
	    
		String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

	    Long memberNoLong = jwtUtil.extractMemberNo(token);
	    int memberNo = memberNoLong.intValue();
		
	    comment.setBoardNo(boardNo); 
	    comment.setMemberNo(memberNo);
	    return service.insert(comment);
	}
	
	/** 댓글 삭제
	 * @param commentNo
	 * @return
	 */
	@DeleteMapping("/{commentNo}")
	public int delete(@PathVariable("commentNo") int commentNo) {
	    return service.delete(commentNo);
	}
	
	/** 댓글 수정
	 * @param comment
	 * @return 
	 */
	@PutMapping("")
	public int update(@RequestBody Comment comment) {
	    return service.update(comment);
	}
}
