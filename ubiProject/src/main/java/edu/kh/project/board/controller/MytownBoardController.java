	package edu.kh.project.board.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
	@Slf4j
	public class MytownBoardController {

    @Autowired
    private MytownBoardService service;

    @GetMapping("/mytownBoard")
    public ResponseEntity<?> getLocalBoardList(
    		  @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다");
        }

        String token = authHeader.substring(7); // "Bearer " 제거

        Member loginMember = service.getMemberByToken(token); // ✅ 토큰으로 사용자 조회
    	
    	
    	
    	System.out.println("🔥 로그인 유저: " + loginMember); // null이면 아직 세션이 안 넘어온 것
       
        
        
        
        if (loginMember == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다");
        }

        List<Board> boardList = service.selectLocalBoardList(
                loginMember.getRegionDistrict(), // 지역 기반 필터링
                loginMember.getMemberNo()        // 좋아요 여부 확인용
        );
        return ResponseEntity.ok(boardList);
    }
    
}
