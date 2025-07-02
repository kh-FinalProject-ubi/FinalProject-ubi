package edu.kh.project.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.session.RowBounds;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.member.model.dto.Member;

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
	List<Board> selectLocalBoardList(RowBounds rowBounds);
	
	int getBoardLocalListCount();
	
	  /**상세조회
	   * 
	   * @param boardNo
	   * @return
	   */
	    Board selectLocalBoardDetail(int boardNo);

	    
	    /** 조회수 증가
	     * 
	     * @param boardNo
	     * @return
	     */
	    int increaseReadCount(int boardNo);

	    
	    
	    
	   // 게시글 작성 
	    int insertBoard(Board dto);

	    int getLastInsertedId();

	    // 해시태그 
	    void insertHashtag(@Param("boardNo") int boardNo, @Param("tag") String tag);

	    int checkHashtagExists(@Param("boardNo") int boardNo, @Param("tag") String tag);
	    
	    // 게시글 이미지 
	    void insertBoardImage(BoardImage img);
	    
	    List<BoardImage> selectBoardImageList(int boardNo);
	    
	    // 이미지 정제 추후 삭제
	    List<BoardImage> selectAllImages();
	    int updateImagePath(@Param("imageNo") int imageNo, @Param("imagePath") String imagePath);
	    
	    
	    
}