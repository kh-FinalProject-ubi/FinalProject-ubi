package edu.kh.project.board.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;

@Mapper
public interface EditBoardMapper {

	/** 게시글 작성
	 * @param inputBoard
	 * @return 게시글 번호 boardNo
	 */
	int boardInsert(Board inputBoard);

	/** 게시글 이미지 모두 삽입
	 * @param uploadList
	 * @return
	 */
	int insertUploadList(List<BoardImage> uploadList);

	/** 게시글 부분(제목/내용) 수정
	 * @param inputBoard
	 * @return
	 */
	int boardUpdate(Board inputBoard);

	/** 게시글 이미지 삭제
	 * @param map
	 * @return
	 */
	int deleteImage(Map<String, Object> map);

	/** 게시글 이미지 수정
	 * @param img
	 * @return
	 */
	int updateImage(BoardImage img);

	/** 게시글 이미지 삽입
	 * @param img
	 * @return
	 */
	int insertImage(BoardImage img);

	/** 게시글 삭제
	 * @param map
	 * @return
	 */
	int boardDelete(Map<String, Object> map);


}
