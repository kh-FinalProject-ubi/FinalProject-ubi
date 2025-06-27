package edu.kh.project.board.model.service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.mapper.EditBoardMapper;
import edu.kh.project.common.util.Utility;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@PropertySource("classpath:/config.properties")
@Slf4j
public class EditBoardServiceImpl implements EditBoardService {

	@Autowired
	private EditBoardMapper mapper;

	@Value("${my.board.web-path}")
	private String webPath; // /images/board/

	@Value("${my.board.folder-path}")
	private String folderPath; // C:/uploadFiles/board/

	// 게시글 작성
	@Override
	public int boardInsert(Board inputBoard, List<MultipartFile> images) throws Exception {

	    // 1. 게시글 INSERT
	    int result = mapper.boardInsert(inputBoard);

	    if (result == 0) return 0;

	    int boardNo = inputBoard.getBoardNo();

	    // 2. 이미지 업로드 처리
	    List<BoardImage> uploadList = new ArrayList<>();

	    if (images != null) {
	        for (int i = 0; i < images.size(); i++) {
	            MultipartFile file = images.get(i);

	            if (!file.isEmpty()) {
	                String originalName = file.getOriginalFilename();
	                String rename = Utility.fileRename(originalName);

	                BoardImage img = BoardImage.builder()
	                        .imageName(rename)
	                        .imagePath(webPath)
	                        .boardNo(boardNo)
	                        .imageOrder(i)
	                        .uploadFile(file)
	                        .build();

	                uploadList.add(img);
	            }
	        }
	    }

	    // 이미지가 없는 경우
	    if (uploadList.isEmpty()) {
	        return boardNo;
	    }

	    // 3. 이미지 DB 저장
	    result = mapper.insertUploadList(uploadList);

	    if (result == uploadList.size()) {
	        for (BoardImage img : uploadList) {
	            img.getUploadFile().transferTo(new File(folderPath + img.getImageName()));
	        }
	    } else {
	        throw new RuntimeException("이미지 일부 삽입 실패 → 전체 롤백");
	    }

	    return boardNo;
	}

	// 게시글 수정
	public int boardUpdate(Board inputBoard, List<MultipartFile> images, String deleteOrderList) throws Exception {
	    int result = mapper.boardUpdate(inputBoard);
	    if (result == 0) return 0;

	    // 이미지 삭제 처리
	    if (deleteOrderList != null && !deleteOrderList.isBlank()) {
	        Map<String, Object> map = new HashMap<>();
	        map.put("deleteOrderList", deleteOrderList);
	        map.put("boardNo", inputBoard.getBoardNo());
	        result = mapper.deleteImage(map);
	        if (result == 0) throw new RuntimeException("이미지 삭제 실패");
	    }

	    if (images == null || images.isEmpty()) {
	        return result;
	    }

	    List<BoardImage> uploadList = new ArrayList<>();
	    String uploadFolder = "C:/uploadFiles/board/";
	    File folder = new File(uploadFolder);
	    if (!folder.exists()) folder.mkdirs();  // 폴더 없으면 생성

	    int successCount = 0;

	    for (int i = 0; i < images.size(); i++) {
	        MultipartFile file = images.get(i);
	        if (!file.isEmpty()) {
	            String originalName = file.getOriginalFilename();
	            String extension = originalName.substring(originalName.lastIndexOf("."));
	            String storedFileName = UUID.randomUUID().toString() + extension;

	            BoardImage img = BoardImage.builder()
	                    .imageName(storedFileName)
	                    .imagePath("/images/board/")
	                    .imageOrder(i)
	                    .boardNo(inputBoard.getBoardNo())
	                    .uploadFile(file)
	                    .build();

	            int updateResult = mapper.updateImage(img);

	            if (updateResult == 0) {
	                updateResult = mapper.insertImage(img);
	            }

	            if (updateResult == 0) {
	                throw new RuntimeException("이미지 수정 또는 삽입 실패");
	            }

	            uploadList.add(img);
	            successCount++;
	        }
	    }

	    for (BoardImage img : uploadList) {
	        img.getUploadFile().transferTo(new File(uploadFolder + img.getImageName()));
	    }

	    return successCount > 0 ? successCount : result;
	}

	
	// 게시글 삭제
	@Override
	public int boardDelete(Map<String, Integer> map) {
		return mapper.boardDelete(map);
	}
	
}
