package edu.kh.project.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.session.RowBounds;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Pagination;

/**
 * 
 */
@Mapper
public interface MytownBoardMapper {
	
	/**
	 * 시군구가 동일한 게시글 목록 조회
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	List<Board> selectLocalBoardList(@Param("regionDistrict") String regionDistrict,
            @Param("regionCity") String regionCity);



}