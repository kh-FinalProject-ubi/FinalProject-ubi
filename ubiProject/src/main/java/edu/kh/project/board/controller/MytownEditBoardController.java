package edu.kh.project.board.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
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
    public ResponseEntity<?> write(
    		@RequestBody Board dto,
    		@RequestPart(value = "images", required = false) List<MultipartFile> images) throws Exception {

        int boardNo = Service.writeBoard(dto,images);
        
        return ResponseEntity.ok(Map.of("boardNo", boardNo));
    }

/**
 * 
 * @param uploadFile
 * @return
 * @throws IOException
 */
	

    @PostMapping("/uploadImage")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
	    if (file.isEmpty()) {
	        return ResponseEntity.badRequest().body("파일이 없습니다.");
	    }

	    // 파일 저장 처리
	    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
	    File dest = new File("C:/uploadFiles/board/" + fileName);

	    try {
	        file.transferTo(dest);
	        return ResponseEntity.ok(fileName);
	    } catch (IOException e) {
	        return ResponseEntity.status(500).body("파일 업로드 실패");
	    }
}}