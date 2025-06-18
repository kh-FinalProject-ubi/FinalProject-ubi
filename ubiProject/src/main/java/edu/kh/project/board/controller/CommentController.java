package edu.kh.project.board.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.service.annotation.PutExchange;

import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.board.model.service.CommentService;

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
@RequestMapping("comments")
//@RequiredArgsConstructor + 메서드 안에 final => @Autowired 기능 
public class CommentController {

	@Autowired
	private CommentService service;
	
	/** 댓글 목록 조회
	 * @param boardNo
	 * @return 
	 */
	@GetMapping("")
	public List<Comment> select(@RequestParam("boardNo") int boardNo){
		// List<Comment> (Java의 자료형 List)
		// HttpMessageConverter가
		// List -> JSON(문자열) 로 변환하여 응답 -> JS
		return service.select(boardNo);
	}
	
	/** 댓글/답글 등록
	 * @return
	 */
	@PostMapping("")
	public int insert(@RequestBody Comment comment) {
		return service.insert(comment);
		
	}
	
	/** 댓글 삭제
	 * @param commentNo
	 * @return
	 */
	@DeleteMapping("")
	public int delete(@RequestBody int commentNo) {
		return service.delete(commentNo);
	}
	
	/** 댓글 수정
	 * @param comment
	 * @return 
	 */
	@PutExchange("")
	public int update(@RequestBody Comment comment) {
		return service.update(comment);
	}

}
