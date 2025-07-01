package edu.kh.project.board.model.service;

import java.io.File;
import java.io.IOException;
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
        public int writeBoard(Board dto) {
        	 // 게시글 등록
            mapper.insertBoard(dto);
            
            
            int boardNo = mapper.getLastInsertedId();

            
            
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
            

            // ✅ 이미지 리스트 저장
            List<BoardImage> imageList = dto.getImageList();
            if (imageList != null && !imageList.isEmpty()) {
                for (BoardImage img : imageList) {
                    img.setBoardNo(boardNo);
                    mapper.insertBoardImage(img);
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

     
		
            
            
        @Override
        public String saveBoardImage(MultipartFile uploadFile) throws IOException {
            String fileName = UUID.randomUUID().toString() + "_" + uploadFile.getOriginalFilename();
            File file = new File(folderPath + fileName);
            uploadFile.transferTo(file);
            return webPath + fileName;
        }
        
        
        
        }


