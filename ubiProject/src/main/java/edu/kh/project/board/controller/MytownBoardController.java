	package edu.kh.project.board.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.board.model.service.MytownBoardService;

@RestController 
	@RequestMapping("/api/board")

	public class MytownBoardController {

    @Autowired
    private MytownBoardService service;

    @GetMapping("/mytownBoard")
    public ResponseEntity<Map<String, Object>> getLocalBoardList(
    		  @RequestParam(value = "page", required = false, defaultValue = "1") int page) {
    	
    	 List<Board> boardList = service.getLocalBoardList(page);
    	    Pagination pagination = service.getPagination(page);

    	    return ResponseEntity.ok()
    	            .body(Map.of(
    	                "boardList", boardList,
    	                "pagination", pagination
    	            ));
    	}
    
    
    @GetMapping("/mytownBoard/{boardNo}")
    public ResponseEntity<Board> getLocalBoardDetail(@PathVariable("boardNo") int boardNo) {
        
        // ✅ 게시글 상세조회
    	Board board = service.selectLocalBoardDetail(boardNo);
        
        if (board != null) {
            return ResponseEntity.ok(board);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        
        
    }
}
