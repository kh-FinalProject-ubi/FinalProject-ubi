package edu.kh.project.board.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.service.BoardService;
import edu.kh.project.board.model.service.EditBoardService;
import edu.kh.project.common.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/editBoard")
@Slf4j
public class EditBoardController {

	@Autowired
	private EditBoardService service;

	@Autowired
	private BoardService boardService;

	// 쥬스텐드에서 memberNo를 가져오기 위해
	// 의존성 주입한 객체
	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private WebApplicationContext context;
	
//	@Value("${my.board.upload-path}")
//	private String uploadPath;


	// 게시글 작성 화면 전환
	@GetMapping("{boardCode:[0-9]+}")
	public String boardInsert(@PathVariable("boardCode") int boardCode) {

		return "board/boardWrite";
	}

	/**
	 * 게시글 작성
	 * 
	 * @param boardCode   : 어떤 게시판에 작성될 글일지 구분 (1/2/3..)
	 * @param inputBoard  : 입력된 값(제목, 내용) 세팅되어있음 (커맨드 객체)
	 * @param loginMember : 로그인한 회원 번호를 얻어오는 용도
	 * @param images      : 제출된 file 타입 input 태그가 전달한 데이터들 (이미지 파일..)
	 * @param ra
	 * @return
	 */
	@PostMapping("/{boardCode:[0-9]+}")
	public ResponseEntity<Map<String, Object>> boardInsert(@PathVariable("boardCode") int boardCode,
			@RequestPart("board") Board inputBoard,
			@RequestPart(value = "images", required = false) List<MultipartFile> images,
			@RequestHeader("Authorization") String authHeader) throws Exception {

		// "Bearer {token}" -> "{token}" 추출
		String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

		Long memberNoLong = jwtUtil.extractMemberNo(token);
		int memberNo = memberNoLong.intValue();

		inputBoard.setBoardType(boardCode);
		inputBoard.setMemberNo(memberNo);

		int boardNo = service.boardInsert(inputBoard, images);

		Map<String, Object> response = new HashMap<>();
		if (boardNo > 0) {
			response.put("success", true);
			response.put("boardNo", boardNo);
			response.put("message", "게시글이 작성되었습니다.");
		} else {
			response.put("success", false);
			response.put("message", "게시글 작성 실패...");
		}

		return ResponseEntity.ok(response);
	}

	/**
	 * 게시글 수정 화면 전환
	 * 
	 * @param boardCode   : 게시판 종류 번호
	 * @param boardNo     : 게시글 번호
	 * @param loginMember : 현재 로그인한 회원 객체(로그인한 회원이 작성한 글이 맞는지 검사하는 용도)
	 * @param model
	 * @param ra
	 * @return
	 */
	@GetMapping("{boardCode:[0-9]+}/{boardNo:[0-9]+}")
	public ResponseEntity<Map<String, Object>> boardUpdate(@PathVariable("boardCode") int boardCode,
			@PathVariable("boardNo") int boardNo,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		Map<String, Integer> map = Map.of("boardCode", boardCode, "boardNo", boardNo);
		Board board = boardService.selectOne(map);

		if (board == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "해당 게시글이 존재하지 않습니다."));
		}

		Long memberNo = null;
		String role = "GUEST";

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			memberNo = jwtUtil.extractMemberNo(token);
			role = jwtUtil.extractRole(token); // "ADMIN" / "USER"
		}

		return ResponseEntity.ok(Map.of("status", 200, "board", board, "role", role, "memberNo", memberNo));
	}

	/**
	 * 게시글 수정
	 * 
	 * @param boardCode       : 게시글 종류 번호
	 * @param boardNo         : 수정할 게시글 번호
	 * @param inputBoard      : 커맨드 객체(제목, 내용)
	 * @param images          : 제출된 input type = "file" 모든 요소 (이미지 파일)
	 * @param loginMember     : 로그인한 회원 번호 이용
	 * @param ra
	 * @param deleteOrderList : 삭제된 이미지 순서가 기록된 문자열 ("1,2,3")
	 * @param cp              : 수정 성공 시 이전 파라미터 유지
	 * @return
	 */
	@PutMapping("{boardCode:[0-9]+}/{boardNo:[0-9]+}")
	public ResponseEntity<Map<String, Object>> boardUpdate(@PathVariable("boardCode") int boardCode,
			@PathVariable("boardNo") int boardNo, @RequestParam("boardTitle") String boardTitle,
			@RequestParam("boardContent") String boardContent,
			@RequestParam(value = "images", required = false) List<MultipartFile> images,
			@RequestParam(name = "boardType") int boardType, @RequestParam("postType") String postType,
			@RequestParam(value = "deleteOrderList", required = false) String deleteOrderList,
			@RequestHeader("Authorization") String authHeader) throws Exception {

		Map<String, Integer> paramMap = Map.of("boardCode", boardCode, "boardNo", boardNo);
		Board board = boardService.selectOne(paramMap);

		if (board == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "게시글이 존재하지 않습니다."));
		}

		Long memberNo = null;
		String role = "GUEST";

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);
			memberNo = jwtUtil.extractMemberNo(token);
			role = jwtUtil.extractRole(token);
		}

		// 권한 체크
		if (boardType == 2) {
			if (!role.equals("ADMIN") && !memberNo.equals(Long.valueOf(board.getMemberNo()))) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "접근 권한이 없습니다."));
			}
		}

		if (boardType == 1 && !role.equals("ADMIN")) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "관리자만 수정할 수 있습니다."));
		}

		board.setBoardTitle(boardTitle);
		board.setBoardContent(boardContent);
		board.setPostType(postType);

		int result = service.boardUpdate(board, images, deleteOrderList);

		if (result > 0) {
			return ResponseEntity.ok(Map.of("message", "수정 완료"));
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "수정 실패"));
		}
	}

	// 삭제 메서드
	// /editBoard/1/2000/delete?cp=1
	@DeleteMapping("{boardCode:[0-9]+}/{boardNo:[0-9]+}")
	public ResponseEntity<String> boardDelete(@PathVariable("boardCode") int boardCode,
			@PathVariable("boardNo") int boardNo, @RequestHeader("Authorization") String authHeader) {

		String token = authHeader.replace("Bearer ", "");
		Long memberNoLong = jwtUtil.extractMemberNo(token);
		int memberNo = memberNoLong.intValue();
		String role = jwtUtil.extractRole(token); // ADMIN, USER 등

		Map<String, Object> map = Map.of("boardCode", boardCode, "boardNo", boardNo, "memberNo", memberNo, "role", role);

		
		int result = service.boardDelete(map);

		if (result > 0) {
			return ResponseEntity.ok("삭제되었습니다.");
		} else {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 실패");
		}
	}

	 //사진 업로드 메서드
	 @PostMapping("/image-upload")
		public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
			if (file.isEmpty()) {
				return ResponseEntity.badRequest().body("파일이 없습니다.");
			}

			// 파일 저장 처리
			String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
			File dest = new File("file:///home/ec2-user/uploadFiles/board/" + fileName);

			try {
				file.transferTo(dest);
				return ResponseEntity.ok(fileName);
			} catch (IOException e) {
				return ResponseEntity.status(500).body("파일 업로드 실패");
			}
		}

}