package edu.kh.project.myPage.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardLike;
import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.myPage.model.dto.UploadFile;
import edu.kh.project.welfare.benefits.model.dto.Facility;
import edu.kh.project.welfare.benefits.model.dto.FacilityJob;
import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.facility.dto.WelfareFacility;

public interface MyPageService {

	/** 파일 업로드 테스트 1
	 * @param uploadFile
	 * @return path
	 */
	String fileUpload1(MultipartFile uploadFile) throws Exception;

	/** 파일 업로드 테스트 2
	 * @param uploadFile
	 * @param memberNo
	 * @return
	 */
	int fileUpload2(MultipartFile uploadFile, int memberNo) throws Exception;

	/** 파일 목록 조회
	 * @param memberNo
	 * @return
	 */
	List<UploadFile> fileList(int memberNo);

	/** 여러파일 업로드 서비스
	 * @param aaaList
	 * @param bbbList
	 * @param memberNo
	 * @return
	 * @throws Exception
	 */
	int fileUpload3(List<MultipartFile> aaaList, 
			List<MultipartFile> bbbList, 
			int memberNo) throws Exception;

	
	//==========================================================================================

	/** 내 기본 정보 조회
	 * @param memberNo
	 * @return
	 */
	Member info(int memberNo);
	
	/** 회원 정보 수정 서비스
	 * @param inputMember
	 * @param memberAddress
	 * @return
	 */
	int updateInfo(Member member);
	

	/** 내가 찜한 혜택 조회
	 * @param memberNo
	 * @param category 
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
	List<Board> baord(int memberNo);

	/** 작성 댓글 조회
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
	
	/** 비밀번호 확인
	 * @param currentPassword
	 * @param memberNo
	 * @return
	 */
	int selectPw(String currentPassword, int memberNo);

	/** 비밀번호 변경
	 * @param currentPw
	 * @param memberNo
	 * @return
	 */
	int changePw(String currentPw, int memberNo);

	/** 회원탈퇴
	 * @param memberNo
	 * @return
	 */
	int withdraw(int memberNo);
	
	/** 프로필 이미지 수정 서비스
	 * @param memberNo
	 * @param memberImg
	 * @return
	 */
	String profile(int memberNo, MultipartFile memberImg);

	/** 프로필 이미지 초기화
	 * @param memberNo
	 * @return
	 */
	int deleteProfile(int memberNo);

	/** 찜 취소
	 * @param map
	 * @return
	 */
	int cancelZzim(Map<String, Object> map);

	Member selectMemberByNo(int memberNo);

	int cancelFacilityZzim(Map<String, Object> map);


	




}
