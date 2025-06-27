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
    public List<Board> getLocalBoardList() {
        return mapper.selectLocalBoardList();
    }
        
    /** 상세조회
     * 
     */
        @Override
        public Board selectLocalBoardDetail(int boardNo) {
            return mapper.selectLocalBoardDetail(boardNo);
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

            if (imageList != null && !imageList.isEmpty()) {
                int imageOrder = 0;

                for (BoardImage img : imageList) {
                    MultipartFile uploadFile = img.getUploadFile();

                    if (uploadFile != null && !uploadFile.isEmpty()) {
                        String originalName = uploadFile.getOriginalFilename();
                        String rename = UUID.randomUUID().toString() + "_" + originalName;

                        File targetFile = new File(folderPath + rename);
                        uploadFile.transferTo(targetFile);

                        if (imageOrder > 0) { // 첫 번째 이미지는 썸네일용 (DB 저장 X)
                            BoardImage boardImage = BoardImage.builder()
                                    .boardNo(boardNo)
                                    .imageOrder(imageOrder)
                                    .imagePath(webPath + rename)
                                    .imageName(rename)
                                    .build();

                            mapper.insertBoardImage(boardImage);
                        }

                        imageOrder++;
                    }
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

        @Override
        public void saveImage(BoardImage image) throws IOException {
            MultipartFile uploadFile = image.getUploadFile();

            if (uploadFile != null && !uploadFile.isEmpty()) {
                String originalName = uploadFile.getOriginalFilename();
                String rename = UUID.randomUUID().toString() + "_" + originalName;

                File targetFile = new File(folderPath + rename);
                uploadFile.transferTo(targetFile);

                image.setImageName(rename);
                image.setImagePath(webPath + rename);

                mapper.insertBoardImage(image);
            }
		

        }}
