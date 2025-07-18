package edu.kh.project.board.controller;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.service.BoardService;
import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.dto.Member;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

	private final BoardService service;
	
	private final JwtUtil jwtUtil;


	@GetMapping("/{boardCode:[0-9]+}")
	public ResponseEntity<Map<String, Object>> selectBoardList(@PathVariable("boardCode") int boardCode,
			@RequestParam(value = "cp", defaultValue = "1") int cp, @RequestParam Map<String, Object> paramMap) {

		Map<String, Object> map;

		if (paramMap.get("key") == null) {
			map = service.selectBoardList(boardCode, cp);
		} else {
			paramMap.put("boardCode", boardCode);
			map = service.searchList(paramMap, cp);
		}

		return ResponseEntity.ok(map);
	}

	// 상세 조회 요청 주소
	// /board/1/1994?cp=1
	// /board/2/1994?cp=2

	/**
	 * 게시글 상세 조회
	 * 
	 * @param boardCode   : 주소에 포함된 게시판 종류 번호 (1/2/3)
	 * @param boardNo     : 주소에 포함된 게시글 번호 (1994..) (boardCode, boardNo Request
	 *                    scope에 저장되어 있음 왜? PathVariable 어노테이션 이용 시 변수값이 request
	 *                    scope에 저장되기 때문에)
	 *
	 * @param model       : 값 전달용 객체
	 * @param loginMember : 로그인 여부와 관련없이 상세 조회할 수 있어야하므로 required = false로 함
	 * @param ra
	 * @return
	 */
	@GetMapping("/{boardCode:[0-9]+}/{boardNo:[0-9]+}")
	public ResponseEntity<Map<String, Object>> getBoardDetail(
	        @PathVariable("boardCode") int boardCode,
	        @PathVariable("boardNo") int boardNo,
	        @RequestHeader(value = "Authorization", required = false) String authHeader,
	        HttpServletRequest req,
	        HttpServletResponse resp) {

	    Map<String, Integer> map = new HashMap<>();
	    map.put("boardCode", boardCode);
	    map.put("boardNo", boardNo);

	    int loginMemberNo = 0;  // 기본값 (비로그인)

	    // Authorization 헤더가 있으면 토큰에서 memberNo 추출
	    if (authHeader != null && authHeader.startsWith("Bearer ")) {
	        String token = authHeader.substring(7);
	        try {
	            Long memberNoLong = jwtUtil.extractMemberNo(token);
	            if (memberNoLong != null) {
	                loginMemberNo = memberNoLong.intValue();
	                map.put("memberNo", loginMemberNo);
	            }
	        } catch (Exception e) {
	            // 토큰이 유효하지 않을 경우 등 예외 처리 (로그 등)
	            System.out.println("JWT 토큰에서 memberNo 추출 실패: " + e.getMessage());
	        }
	    }

	    Board board = service.selectOne(map);

	    if (board == null) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(Map.of("message", "게시글이 존재하지 않습니다."));
	    }

	    // 조회수 증가 로직 (쿠키 중복 조회 방지)
	    if (loginMemberNo == 0 || loginMemberNo != board.getMemberNo()) {
	        Cookie[] cookies = req.getCookies();
	        Cookie c = null;

	        if (cookies != null) {
	            for (Cookie temp : cookies) {
	                if ("readBoardNo".equals(temp.getName())) {
	                    c = temp;
	                    break;
	                }
	            }
	        }

	        int result = 0;
	        if (c == null) {
	            c = new Cookie("readBoardNo", "[" + boardNo + "]");
	            result = service.updateReadCount(boardNo);
	        } else if (!c.getValue().contains("[" + boardNo + "]")) {
	            c.setValue(c.getValue() + "[" + boardNo + "]");
	            result = service.updateReadCount(boardNo);
	        }

	        if (result > 0) {
	            board.setBoardReadCount(result);
	            c.setPath("/");

	            LocalDateTime now = LocalDateTime.now();
	            LocalDateTime midnight = now.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
	            long seconds = Duration.between(now, midnight).getSeconds();
	            c.setMaxAge((int) seconds);

	            resp.addCookie(c);
	        }
	    }

	    int isLiked = 0;
	    if (loginMemberNo != 0) {
	        isLiked = service.checkBoardLike(map);
	    }

	    int likeCount = service.selectLikeCount(boardNo);

	    System.out.println("getBoardDetail - loginMemberNo: " + loginMemberNo);
	    System.out.println("getBoardDetail - map: " + map);

	    return ResponseEntity.ok(Map.of(
	            "status", 200,
	            "board", board,
	            "loginMemberNo", loginMemberNo,
	            "isLiked", isLiked,
	            "likeCount", likeCount
	    ));
	}
	
	/**
	 * 게시글 좋아요 체크/해제
	 * 
	 * @return
	 */
	@PostMapping("/{boardNo}/like")
	public ResponseEntity<Map<String, Object>> boardLike(@PathVariable("boardNo") int boardNo,
	                                                     @RequestBody Map<String, Integer> map,
	                                                     @RequestHeader(value = "Authorization", required = false) String authHeader) {
	    map.put("boardNo", boardNo);

	    // JWT 토큰에서 memberNo 추출해서 map에 넣기 (필요 시)
	    if (authHeader != null && authHeader.startsWith("Bearer ")) {
	        String token = authHeader.substring(7);
	        try {
	            Long memberNoLong = jwtUtil.extractMemberNo(token);
	            if (memberNoLong != null) {
	                map.put("memberNo", memberNoLong.intValue());
	            }
	        } catch (Exception e) {
	            // 토큰 에러 처리
	        }
	    }

	    int likeCount = service.boardLike(map);
	    int isLiked = 0;

	    Integer memberNo = map.get("memberNo");
	    if (memberNo != null && memberNo != 0) {
	        isLiked = service.checkBoardLike(map);
	    }

	    Map<String, Object> result = new HashMap<>();
	    result.put("likeCount", likeCount);
	    result.put("isLiked", isLiked);

	    return ResponseEntity.ok(result);
	}
}