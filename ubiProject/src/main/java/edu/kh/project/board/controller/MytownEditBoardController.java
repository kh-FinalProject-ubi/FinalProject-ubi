package edu.kh.project.board.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.service.MytownBoardService;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/editboard/mytown")
@Slf4j
public class MytownEditBoardController {

    @Value("${my.board.folder-path}")
    private String folderPath;

    @Value("${my.board.web-path}")
    private String webPath;

	@Autowired
	private MytownBoardService Service;


	/**
	 * 
	 * @param dto
	 * @return
	 */
	@PostMapping("/write")
    public ResponseEntity<?> write(@RequestBody Board dto) {

        int boardNo = Service.writeBoard(dto);
        
        return ResponseEntity.ok(Map.of("boardNo", boardNo));
    }
	
	
	/**
	 * 
	 * @param boardNo
	 * @param memberNo
	 * @return
	 */
	
	@DeleteMapping("/{boardNo}/delete")
	public ResponseEntity<?> deleteBoard(
		    @PathVariable("boardNo") int boardNo,
		    @RequestParam("memberNo") int memberNo) {
	    int result = Service.deleteBoard(boardNo, memberNo);
	    if (result > 0) {
	        return ResponseEntity.ok("삭제 성공");
	    } else {
	        return ResponseEntity.status(403).body("삭제 실패 또는 권한 없음");
	    }
	}

	
	/** 글쓰기 수정 
	 * 
	 * @param boardNo
	 * @param dto
	 * @return
	 */
	@PostMapping("/{boardNo}/update")
	public ResponseEntity<?> updateBoard(@PathVariable int boardNo, @RequestBody Board dto) {
	    dto.setBoardNo(boardNo);
	    int result = Service.updateBoard(dto);
	    if (result > 0) {
	        return ResponseEntity.ok("수정 성공");
	    } else {
	        return ResponseEntity.status(403).body("수정 실패 또는 권한 없음");
	    }
	}
	
	
/**
 * 
 * @param uploadFile
 * @return
 * @throws IOException
 */
	

    @PostMapping("/uploadImage")
    public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile uploadFile) throws IOException {
    	  String imageUrl = Service.saveBoardImage(uploadFile);
    	    return ResponseEntity.ok().body(imageUrl); // ✅ MIME 타입 자동 지정
    }
}