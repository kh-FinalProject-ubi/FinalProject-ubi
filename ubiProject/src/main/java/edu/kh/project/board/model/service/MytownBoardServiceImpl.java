package edu.kh.project.board.model.service;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.ibatis.session.RowBounds;
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

	    int offset = (page - 1) * pagination.getLimit(); // 시작 위치
	    int limit = pagination.getLimit();               // 가져올 개수


	    RowBounds rowBounds = new RowBounds(offset, limit);
	    
	    return mapper.selectLocalBoardList(rowBounds);
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
            return (webPath + "/" + fileName).replaceAll("/+", "/"); // 슬래시 2번 이상 → 1번
        }
        
        
        
/** 게시글 좋아요 
 * 
 */
        @Override
        public int checkBoardLike(int boardNo, int memberNo) {
            return mapper.checkBoardLike(boardNo, memberNo);
        }

        @Override
        public int insertBoardLike(int boardNo, int memberNo) {
            return mapper.insertBoardLike(boardNo, memberNo);
        }

        @Override
        public int deleteBoardLike(int boardNo, int memberNo) {
            return mapper.deleteBoardLike(boardNo, memberNo);
        }
        
        
        /**
         * 삭제하기
         */
        @Override
        public int deleteBoard(int boardNo, int memberNo) {
            return mapper.deleteBoard(boardNo, memberNo);
        }
        
        
        /** 수정 하기 
         * 
         */
        @Override
        public int updateBoard(Board dto) {
        	 // 1. 게시글 수정
            int result = mapper.updateBoard(dto);

            // 2. 기존 이미지 삭제
            mapper.deleteImagesByBoardNo(dto.getBoardNo());

            // 3. 새 이미지 삽입
            if (dto.getImageList() != null && !dto.getImageList().isEmpty()) {
                for (int i = 0; i < dto.getImageList().size(); i++) {
                    BoardImage img = dto.getImageList().get(i);
                    img.setBoardNo(dto.getBoardNo());
                    img.setImageOrder(i); // 0번이 썸네일

                    mapper.insertBoardImage(img);
                }
            }

            return result;
        }


		

        
        }
        


