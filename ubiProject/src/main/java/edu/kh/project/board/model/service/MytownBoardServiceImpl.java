package edu.kh.project.board.model.service;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.board.model.mapper.MytownBoardMapper;
import edu.kh.project.common.util.Utility;

@Service
public class MytownBoardServiceImpl implements MytownBoardService {
	
    @Value("${my.board.folder-path}")
    private String folderPath;

    @Value("${my.board.web-path}")
    private String webPath;

	@Autowired
	private MytownBoardMapper mapper;

	/** 게시글 목록조회 시군구 조건 제외 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	@Override
	public List<Board> getLocalBoardList(int page) {
	    int listCount = mapper.getBoardLocalListCount(); // 전체 게시글 수 조회
	    Pagination pagination = new Pagination(page, listCount);

	    int start = (page - 1) * pagination.getLimit();
	    int limit = pagination.getLimit();

	    return mapper.selectLocalBoardList(start, limit);
	}

	@Override
	public Pagination getPagination(int page) {
		int listCount = mapper.getBoardLocalListCount();
	    return new Pagination(page, listCount);
	}
    /** 상세조회
     * 
     */
        @Override
        public Board selectLocalBoardDetail(int boardNo) {
            Board board = mapper.selectLocalBoardDetail(boardNo);
            
            int result = mapper.increaseReadCount(boardNo);

            if (board != null) {
                List<BoardImage> imageList = mapper.selectBoardImageList(boardNo);
                board.setImageList(imageList);
            }
        

        return board;
    } 
   
        
     /**
      *  
      * @param dto
      * @return
      */
        @Override
        public int writeBoard(Board dto, List<MultipartFile> images) throws Exception {
        	  // 1. 게시글 INSERT
    	    int result = mapper.insertBoard(dto);
            
    	    if (result == 0) return 0;

            int boardNo = mapper.getLastInsertedId();

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

    	    if (!uploadList.isEmpty()) {
    	        result = mapper.insertUploadList(uploadList);
    	        if (result == uploadList.size()) {
    	            for (BoardImage img : uploadList) {
    	                img.getUploadFile().transferTo(new File(folderPath + img.getImageName()));
    	            }
    	        } else {
    	            throw new RuntimeException("이미지 일부 삽입 실패 → 전체 롤백");
    	        }
    	    }
            
            // 해시태그 중복 없이 삽입
            if (dto.getHashtagList() != null) {
                for (String tag : dto.getHashtagList()) {
                    // 중복 체크 후 없을 경우에만 삽입
                    int exists = mapper.checkHashtagExists(boardNo, tag);
                    if (exists == 0) {
                        mapper.insertHashtag(boardNo, tag);
                    }
                }  
                
        
            }
            return boardNo; 
            }
            

          
        
        
        

        /**  해시태그
         * 
         */
        @Override
        public void insertHashtag(int boardNo, String tag) {
            mapper.insertHashtag(boardNo, tag);
        }

     
		
            
            
        }

