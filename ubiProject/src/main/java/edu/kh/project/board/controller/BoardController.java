package edu.kh.project.board.controller;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImg;
import edu.kh.project.board.model.service.BoardService;
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

	@GetMapping("/{boardCode:[0-9]+}")
	public ResponseEntity<Map<String, Object>> selectBoardList(
			@PathVariable("boardCode") int boardCode,
			@RequestParam(value = "cp", defaultValue = "1") int cp,
			@RequestParam Map<String, Object> paramMap) {

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
	@GetMapping("{boardCode:[0-9]+}/{boardNo:[0-9]+}")
	public String boardDetail(@PathVariable("boardCode") int boardCode, @PathVariable("boardNo") int boardNo,
			Model model, @SessionAttribute(value = "loginMember", required = false) Member loginMember,
			RedirectAttributes ra, HttpServletRequest req, // 요청에 담긴 쿠키 얻어오기
			HttpServletResponse resp // 새로운 쿠키 만들어서 응답하기
	) {

		// 게시글 상세 조회 서비스 호출

		// 1) Map으로 전달할 파라미터 묶기
		Map<String, Integer> map = new HashMap<>();
		map.put("boardCode", boardCode);
		map.put("boardNo", boardNo);

		// 로그인 상태에만 memberNo 추가
		if (loginMember != null) {
			map.put("memberNo", loginMember.getMemberNo());

		}

		// 2) 서비스 호출
		Board board = service.selectOne(map);

		String path = null;

		// 조회 결과가 없는 경우
		if (board == null) {
			path = "redirect:/board/" + boardCode; // 목록 재요청
			ra.addFlashAttribute("message", "게시글이 존재하지 않습니다.");

		} else {

			/*------------------쿠키를 이용한 조회 수 증가 시작---------------------*/

			// 비회원 또는 로그인한 회원의 글이 아닌 경우 ( == 글쓴이를 뺀 다른 사람 )
			if (loginMember == null || loginMember.getMemberNo() != board.getMemberNo()) {

				// 요청에 담겨있는 모든 쿠키 얻어오기
				Cookie[] cookies = req.getCookies();

				Cookie c = null;

				for (Cookie temp : cookies) {

					// 요청에 담긴 쿠키에 "readBoardNo" 가 존재할 때
					if (temp.getName().equals("readBoardNo")) {
						c = temp;
						break;
					}

				}

				int result = 0; // 조회수 증가 결과를 저장할 변수

				// "readBoardNo"가 쿠키에 없을 때
				if (c == null) {

					// 새 쿠키 생성 ("readBoardNo", [게시글 번호])
					c = new Cookie("readBoardNo", "[" + boardNo + "]");
					result = service.updateReadCount(boardNo);

				} else {
					// "readBoardNo"가 쿠키에 있을 때
					// "readBoardNo" : [2], [30], [400]

					// 현재 게시글을 처음 읽는 경우
					if (c.getValue().indexOf("[" + boardNo + "]") == -1) {

						// 해당 글 번호를 쿠키에 누적 + 서비스 호출
						c.setValue(c.getValue() + "[" + boardNo + "]");
						result = service.updateReadCount(boardNo);

					}

				}

				// 조회 수 증가 성공 / 조회 성공 시
				if (result > 0) {

					// 먼저 조회된 board의 readCount 값을
					// result 값으로 다시 세팅
					board.setBoardReadCount(result);

					// 쿠키 적용 경로 설정
					c.setPath("/"); // "/" 이하 경로 요청 시 쿠키 서버로 전달

					// 쿠키 수명 지정
					// 현재 시간을 얻어오기
					LocalDateTime now = LocalDateTime.now();

					// 다음날 자정 지정
					LocalDateTime nextDayMidnight = now.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

					// 현재시간부터 다음날 자정까지 남은 시간 계산(초단위)
					long seconds = Duration.between(now, nextDayMidnight).getSeconds();

					// 쿠키 수명 설정
					c.setMaxAge((int) seconds);

					resp.addCookie(c); // 응답 객체를 이용해서 클라이언트에게 쿠키 전달
				}

			}

			/*------------------쿠키를 이용한 조회 수 증가 끝---------------------*/

			// 조회 결과가 있는 경우
			path = "board/boardDetail"; // boardDetail.html로 forward

			// board - 게시글 일반 내용 + imageList + commentList
			model.addAttribute("board", board);

			// 조회된 이미지 목록이 있을 경우
			if (!board.getImageList().isEmpty()) {

				BoardImg thumbnail = null;

				// imageList의 0번 인덱스 == 가장 빠른 순서(imgOrder)
				// 만약 이미지 목록의 첫 번째 행의 imgOrder가 0 == 썸네일인 경우
				if (board.getImageList().get(0).getImgOrder() == 0) {

					thumbnail = board.getImageList().get(0);

				}

				model.addAttribute("thumbnail", thumbnail);
				model.addAttribute("start", thumbnail != null ? 1 : 0);
				// start : 썸네일이 있다면 1, 없다면 0을 저장
			}

		}

		return path;
	}

	/**
	 * 게시글 좋아요 체크/해제
	 * 
	 * @return
	 */
	@ResponseBody
	@PostMapping("like") // /board/like (POST)
	public int boardLike(@RequestBody Map<String, Integer> map) {
		return service.boardLike(map);

	}
}
