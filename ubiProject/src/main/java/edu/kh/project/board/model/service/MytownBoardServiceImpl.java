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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MytownBoardServiceImpl implements MytownBoardService {


	@Autowired
	private MytownBoardMapper mapper;

	/** 시군구가 동일한 게시글 목록조회 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	@Override
	public List<Board> selectLocalBoardList(String regionDistrict, String regionCity) {
	    return mapper.selectLocalBoardList(regionDistrict, regionCity);
	}

}
