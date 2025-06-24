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
        
}
