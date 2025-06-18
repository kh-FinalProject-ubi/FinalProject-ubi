package edu.kh.project.admin.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.member.model.dto.Member;

@Mapper
public interface AdminMapper {


	/** 관리자 로그인
	 * @param memberEmail
	 * @return
	 */
	Member login(String memberEmail);

	
	/** 조회수
	 * @return
	 */
	Board maxReadCount();

	/** 좋아요수
	 * @return
	 */
	Board maxLikeCount();

	/** 최대 댓글 수
	 * @return
	 */
	Board maxCommentCount();

	/** 사용자 조회
	 * @return
	 */
	List<Member> newMemberInWeekData();


	/** 탈퇴한 회원 목록 조회
	 * @return
	 */
	List<Member> selectWithdrawnMemberList();


	/** 삭제된 게시글 목록 조회
	 * @return
	 */
	List<Board> selectDeleteBoardList();

	int restoreMember(int memberNo);
	
	int restoreBoard(int boardNo);


	/** 관리자 이메일 중복 검사
	 * @param memberEmail
	 * @return
	 */
	int checkEmail(String memberEmail);


	/** 관리자 비밀번호
	 * @param member
	 * @return
	 */
	int createAdminAccount(Member member);


	/** 관리자 계좌
	 * @return
	 */
	List<Member> selectAdminAccount();
	

}
