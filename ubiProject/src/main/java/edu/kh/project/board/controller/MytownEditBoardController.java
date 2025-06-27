package edu.kh.project.board.controller;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

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
	 * @param image
	 * @return
	 * @throws IOException
	 */
	
	@PostMapping("/uploadImage")
	public String uploadImage(@RequestParam("image") MultipartFile image) throws IOException {
//	    // 저장 경로
//	    String folderPath = FolderPath; // "C:/uploadFiles/board/"
//	    String webPath = WebPath;       // "/images/board/"

	    // 원본 파일명
	    String originalName = image.getOriginalFilename();
	    String rename = UUID.randomUUID().toString() + "_" + originalName;

	    File targetFile = new File(folderPath + rename);
	    image.transferTo(targetFile); // 실제 저장

	    return webPath + rename; // 클라이언트에 반환 (썸머노트에 삽입될 src)
	}
}