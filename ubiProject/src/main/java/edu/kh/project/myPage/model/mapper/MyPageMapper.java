package edu.kh.project.myPage.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardLike;
import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.myPage.model.dto.UploadFile;
import edu.kh.project.welfare.benefits.model.dto.Facility;
import edu.kh.project.welfare.benefits.model.dto.FacilityJob;
import edu.kh.project.welfare.benefits.model.dto.Welfare;

/**
 * 
 */
@Mapper
public interface MyPageMapper {
	

	/** 파일 정보를 DB에 삽입
	 * @param uf
	 * @return
	 */
	int insertUploadFile(UploadFile uf);

	/** 파일 목록 조회
	 * @param memberNo
	 * @return
	 */
	List<UploadFile> fileList(int memberNo);

	
	//-----------------------------------------------------------------------------------

	/** 내 기본 정보 조회
	 * @param memberNo
	 * @return
	 */
	Member info(int memberNo);
	
	/** 회원 정보 수정
	 * @param inputMember
	 * @return
	 */
	int updateInfo(Member member);

	
	/** 내가 찜한 혜택 조회
	 * @param memberNo
	 * @return
	 */
	List<Welfare> getWelfareBenefits(int memberNo);

	/** 내가 찜한 채용 조회
	 * @param memberNo
	 * @return
	 */
	List<FacilityJob> getRecruitBenefits(int memberNo);
	
	/** 내가 찜한 시설 조회
	 * @param memberNo
	 * @return
	 */
	List<Facility> getFacilityBenefits(int memberNo);
	
	
	/** 작성글 조회
	 * @param memberNo
	 * @return
	 */
	List<Board> board(int memberNo);

	/** 작성글에 포함된 해시태그 조회
	 * @param boardNoList
	 * @return
	 */
	List<Map<String, Object>> selectHashtagsByBoardNoList(@Param("boardNoList") List<Integer> boardNoList);

	/** 작성댓글 조회
	 * @param memberNo
	 * @return
	 */
	List<Comment> Comment(int memberNo);
	
	/** 내가 좋아요를 누른 게시글 조회
	 * @param memberNo
	 * @return
	 */
	List<BoardLike> like(int memberNo);

	/** 내가 좋아요를 누른 댓글 조회
	 * @param memberNo
	 * @return
	 */
	List<Comment> likeComment(int memberNo);
	
	/** 회원의 비밀번호 조회 
	 * @param memberNo
	 * @return
	 */
	String selectPw(int memberNo);

	/** 회원 비밀번호 변경
	 * @param paramMap
	 * @return
	 */
	int changePw(Map<String, String> paramMap);

	/** 회원 탈퇴
	 * @param memberNo
	 * @return
	 */
	int withdraw(int memberNo);

	/** 프로필 이미지 초기화
	 * @param memberNo
	 * @return
	 */
	int deleteProfile(int memberNo);

	/** 프로필 이미지 변경
	 * @param member
	 * @return
	 */
	int profile(Member member);

	/** 찜 취소
	 * @param map
	 * @return
	 */
	int cancelZzim(Map<String, Object> map);

	Member selectMemberByNo(int memberNo);

	int updateFacilityZzimDelFl(Map<String, Object> map);

	int cancelFacilityZzim(Map<String, Object> map);



}
