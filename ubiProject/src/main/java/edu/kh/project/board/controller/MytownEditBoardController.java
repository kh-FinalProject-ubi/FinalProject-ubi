package edu.kh.project.board.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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