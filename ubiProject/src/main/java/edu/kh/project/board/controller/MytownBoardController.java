	package edu.kh.project.board.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.service.MytownBoardService;
import edu.kh.project.member.model.dto.Member;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@RestController 
	@RequestMapping("/api/board")

	public class MytownBoardController {

    @Autowired
    private MytownBoardService service;

    @GetMapping("/mytownBoard")
    public ResponseEntity<List<Board>> getLocalBoardList() {
    	        return ResponseEntity.ok(service.getLocalBoardList());
    	    }
    
    
    @GetMapping("/mytownBoard/{boardNo}")
    public ResponseEntity<Board> getLocalBoardDetail(@PathVariable("boardNo") int boardNo) {
        
    	Board board = service.selectLocalBoardDetail(boardNo);
        
        if (board != null) {
            return ResponseEntity.ok(board);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
