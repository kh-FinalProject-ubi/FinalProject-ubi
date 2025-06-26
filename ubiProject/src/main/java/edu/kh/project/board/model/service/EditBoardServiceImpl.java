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

		// 1. 게시글 부분을 먼저
		// BOARD 테이블 INSERT 하기
		// -> INSERT 결과로 작성된 게시글 번호 반환 받기
		int result = mapper.boardInsert(inputBoard);

		// result == INSERT 결과 (삽입 성공한 행의 개수 0 or 1)

		// 삽입 실패 시

		if (result == 0) {
			return 0;
		}

		// 삽입 성공 시
		// 삽입된 게시글의 번호를 변수로 저장
		// mapper.xml에서 <selectKey> 태그를 이용해서 생성된
		// boardNo가 inputBoard에 저장된 상태! (얕은 복사 개념)
		int boardNo = inputBoard.getBoardNo();

		// 2. 업로드된 이미지가 실제로 존재할 경우
		// 업로드된 이미지만 별도로 저장하여
		// BOARD_IMG 테이블에 삽입하는 코드 작성

		// 실제 업로드된 이미지의 정보를 모아둘 List 생성
		List<BoardImage> uploadList = new ArrayList<>();

		// images 리스트에서 하나씩 꺼내어 파일이 있는지 검사
		for (int i = 0; i < images.size(); i++) {

			// 실제 선택된 파일이 존재하는 경우
			if (!images.get(i).isEmpty()) {

				// 원본명
				String originalName = images.get(i).getOriginalFilename();

				// 변경명
				String rename = Utility.fileRename(originalName);

				// 모든 값을 저장할 DTO 생성
				BoardImage img = BoardImage.builder()
						.imageName(originalName)
						.imagePath(webPath)
						.boardNo(boardNo)
						.imageOrder(i)
						.uploadFile(images.get(i))
						.build();

				// 해당 BoardImg 를 uploadList에 추가
				uploadList.add(img);

			}

		}

		// 선택한 파일이 전부 없을 경우

		if (uploadList.isEmpty()) {
			return boardNo; // 컨트롤러로 현재 제목/상세내용 삽입된 게시글 번호 리턴

		}

		// 선택한 파일이 존재할 경우
		// -> "BOARD_IMG" 테이블에 insert + 서버에 파일 저장

		// result == 삽입된 행의 개수 == uploadList.size()
		result = mapper.insertUploadList(uploadList);

		// 다중 INSERT 성공 확인
		// (uploadList 에 저장된 값이 모두 정상 삽입 되었는가)
		if (result == uploadList.size()) {

			// 서버에 저장
			for(BoardImage img : uploadList) {
				img.getUploadFile().transferTo(new File(folderPath + img.getImageName()));
			
			}
			
		} else {  
			// 부분적으로 삽입 실패
			// ex) uploadList에 2개 저장
			// -> 1개 삽입 성공 1개는 실패
			// -> 전체 서비스 실패로 판단
			// -> 이전에 삽입된 내용 모두 rollback
			
			// rollback하는 방법
			// == Exception 강제 발생(@Transactional)
			throw new RuntimeException();
			
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
