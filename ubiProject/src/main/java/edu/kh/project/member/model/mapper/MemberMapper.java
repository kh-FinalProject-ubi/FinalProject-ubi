package edu.kh.project.member.model.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import edu.kh.project.member.model.dto.Member;

@Mapper
public interface MemberMapper {

	/**
	 * 로그인 SQL 실행
	 * 
	 * @param memberId
	 * @return
	 */
	Member login(String memberId);

	/**
	 * 이메일 중복검사
	 * 
	 * @param memberEmail
	 * @return
	 */
	int checkEmail(String memberEmail);

	/**
	 * 닉네임 중복 검사
	 * 
	 * @param memberNickname
	 * @return
	 */
	int checkNickname(String memberNickname);

	/**
	 * 회원 가입
	 * 
	 * @param inputMember
	 * @return
	 */
	int signup(Member inputMember);

	int checkMemberId(String memberId);

	void insertKakaoMember(Member newMember);

	Member selectByKakaoId(String kakaoId);

	Member selectByNo(Long memberNo);

	// 댓글 신고 3번 당하면 memberReportCount +-1 해주는 메서드
	int updateMemberReportCount(@Param("memberNo") int memberNo, @Param("delta") int delta);

	// 이미 신고가 있는지 확인하는 메서드
	String checkReportStatus(@Param("targetMemberNo") int targetMemberNo,
			@Param("reporterMemberNo") int reporterMemberNo);

	// 멤버 테이블에 report_count 수가 얼마나 있는지 확인
	int selectReportCount(int targetMemberNo);

	// report 테이블에 멤버 신고 올리기
	int insertReport(@Param("targetMemberNo") int targetMemberNo, @Param("reporterMemberNo") int reporterMemberNo,
			@Param("reason") String reason);

	// 멤버 테이블에 report_count +1
	void increaseMemberReportCount(int targetMemberNo);

	// 신고 상태 변경 N
	int updateReportStatus(@Param("targetMemberNo") int targetMemberNo, @Param("reporterMemberNo") int reporterMemberNo,
			@Param("reason") String reason, @Param("status") String string);

	// 멤버 테으블의 report_count -1
	int decreaseMemberReportCount(int targetMemberNo);

	// 로그인 정지 기능 넣는 메서드
	void insertSuspension(@Param("targetMemberNo") int targetMemberNo, @Param("start") LocalDate now,
			@Param("end") LocalDate plusDays);

	void insertSuspension(@Param("targetMemberNo") int targetMemberNo, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);

	// 로그인 정지 기능 없애는 메서드
	int deleteSuspension(@Param("targetMemberNo") int targetMemberNo);

	// 로그인 정지 기능 연습 확인
	void insertSuspensionTest(@Param("targetMemberNo") int targetMemberNo, @Param("start") LocalDateTime now,
			@Param("end") LocalDateTime end);

	void updateReportStatusSuspension(int memberNo);

	// 정지 기능을 위해 멤버 테이블의 카운트만 체크하는 메서드
	int selectMemberReportCount(int targetMemberNo);

	// 로그인 할 때 정지 되었는지 확인
	Map<String, String> selectSuspension(int memberNo);

	// 로그인 정지 알람이 떴었다~
	void updateSuspensionNotified(int memberNo);

	// 멤버 테이블에 report 카운트 리셋
	void resetReportCount(int memberNo);

	Member selectMemberByNo(long memberNo);

	// 정지 연장 메서드
	void extendSuspensionEnd(@Param("targetMemberNo") int targetMemberNo, @Param("end") LocalDateTime end);

	// 아이디 찾기
	String selectMemberIdByNameAndEmail(@Param("name") String name, @Param("email") String email);

	// 아이디, 이메일 확인하기
	int checkMemberIdAndEmail(@Param("memberId") String memberId, @Param("email") String email);

	// 비밀번호 업데이트
	int updatePassword(@Param("memberId") String memberId, @Param("newEncPw") String newEncPw);

	String selectMemberRegionCity(int memberNo);

	String selectMemberRegionDistrict(int memberNo);

	Integer selectMemberAuthority(int memberNo);

	Integer existsByNameAndEmail(@Param("name") String name, @Param("email") String email);

	Integer existsByNameAndMemberIdAndEmail(@Param("name") String name, @Param("memberId") String memberId,
			@Param("email") String email);

	String findPasswordById(String memberId);

	// 연장 삭제
	void extendSuspensionEnd(Map<String, Object> param);

	int selectEmailCount(String email);

}
