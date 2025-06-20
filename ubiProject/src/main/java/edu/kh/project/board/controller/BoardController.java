package edu.kh.project.board.controller;

import edu.kh.project.member.model.dto.Member;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.service.BoardService;

@RestController
@RequestMapping("/api") // REST API는 /api로 prefix 주는 경우 많음
public class BoardController {

	@Autowired
	private BoardService service;

	@GetMapping("/noticeBoard")
	public ResponseEntity<Map<String, Object>> noticeBoardList(
	    @RequestParam(value = "code", defaultValue = "1") int boardCode,
	    @RequestParam(value = "cp", defaultValue = "1") int cp
	) {
	    try {
	        Map<String, Object> result = service.selectBoardList(boardCode, cp);
	        System.out.println("값 맞냐? : " + result);
	        return ResponseEntity.ok(result);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("error", "공지사항 리스트 조회 중 문제 발생: " + e.getMessage()));
	    }
	}

	
}
