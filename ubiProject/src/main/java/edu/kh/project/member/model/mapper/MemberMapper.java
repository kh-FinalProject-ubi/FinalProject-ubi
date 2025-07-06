package edu.kh.project.member.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import edu.kh.project.member.model.dto.Member;

@Mapper
public interface MemberMapper {

	/** 로그인 SQL 실행
	 * @param memberId
	 * @return
	 */
	Member login(String memberId);

	/** 이메일 중복검사
	 * @param memberEmail
	 * @return
	 */
	int checkEmail(String memberEmail);

	/** 닉네임 중복 검사
	 * @param memberNickname
	 * @return
	 */
	int checkNickname(String memberNickname);

	/** 회원 가입 
	 * @param inputMember
	 * @return
	 */
	int signup(Member inputMember);


	int checkMemberId(String memberId);

	void insertKakaoMember(Member newMember);

	Member selectByKakaoId(String kakaoId);

	Member selectByNo(Long memberNo);

	// 신고 3번 당하면 memberReportCount +-1 해주는 메서드
	void updateMemberReportCount(@Param("memberNo") int memberNo, @Param("delta") int delta);


	
}
