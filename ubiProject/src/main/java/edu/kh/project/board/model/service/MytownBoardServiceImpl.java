package edu.kh.project.board.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Pagination;

import edu.kh.project.board.model.mapper.MytownBoardMapper;
import edu.kh.project.member.model.dto.Member;

@Service
public class MytownBoardServiceImpl implements MytownBoardService {


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
