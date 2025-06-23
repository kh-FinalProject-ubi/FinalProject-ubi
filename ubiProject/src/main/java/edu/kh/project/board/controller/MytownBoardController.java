	package edu.kh.project.board.controller;

	import java.time.Duration;
	import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

	import org.springframework.beans.factory.annotation.Autowired;
	import org.springframework.stereotype.Controller;
	import org.springframework.ui.Model;
	import org.springframework.web.bind.annotation.GetMapping;
	import org.springframework.web.bind.annotation.PathVariable;
	import org.springframework.web.bind.annotation.PostMapping;
	import org.springframework.web.bind.annotation.RequestBody;
	import org.springframework.web.bind.annotation.RequestMapping;
	import org.springframework.web.bind.annotation.RequestParam;
	import org.springframework.web.bind.annotation.ResponseBody;
	import org.springframework.web.bind.annotation.SessionAttribute;
	import org.springframework.web.servlet.mvc.support.RedirectAttributes;

	import edu.kh.project.board.model.dto.Board;
	import edu.kh.project.board.model.dto.BoardImg;
import edu.kh.project.board.model.service.MytownBoardService;
import edu.kh.project.member.model.dto.Member;
	import jakarta.servlet.http.Cookie;
	import jakarta.servlet.http.HttpServletRequest;
	import jakarta.servlet.http.HttpServletResponse;
	import lombok.extern.slf4j.Slf4j;

	@Controller
	@RequestMapping("mytownBoard")
	@Slf4j
	public class MytownBoardController {

		@Autowired
		private MytownBoardService service;

		/**
		 * 게시글 목록 조회
		 * @return 
		 */
		@GetMapping
		@ResponseBody  
		public List<Board> getLocalBoardList(
			    @SessionAttribute(value = "loginMember", required = false) Member loginMember
			) {
			    if (loginMember == null) return Collections.emptyList();

			    return service.selectLocalBoardList(
			        loginMember.getRegionDistrict(),
			        loginMember.getRegionCity()
			    );
			}
		
	}