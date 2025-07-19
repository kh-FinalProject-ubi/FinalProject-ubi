package edu.kh.project.member.model.service;

import edu.kh.project.member.model.dto.Member;

public interface MemberService {

	/** 로그인 서비스 (ID / PW 기반) */
	Member login(String memberId, String memberPw);

	/** 이메일 중복 검사 */
	int checkEmail(String memberEmail);

	/** 닉네임 중복 검사 */
	int checkNickname(String memberNickname);

	/** 회원 가입 서비스 */
	int signup(Member inputMember);

	/**
	 * 카카오 로그인 - 토큰 기반 처리 등 확장 가능
	 * 
	 * @throws Exception
	 */
	Member kakaoLogin(String authorizationCode) throws Exception;

	String createRandomCode();

	boolean sendAuthCodeToEmail(String email, String authCode);

	boolean checkIdAvailable(String memberId);

	boolean checkNicknameAvailable(String memberNickname);

	Member findByNo(Long memberNo);

	// 멤버 테이블 신고시
	boolean reportMember(int targetMemberNo, int reporterMemberNo, String reason);

	// 아이디 찾기
	String findIdByNameAndEmail(String name, String email);

	// 비밀번호 재설정
	boolean resetPassword(String memberId, String newPassword);	

	// 이름, 이메일이 db에 존재하는 지 확인하는 메소드
	Integer existsByNameAndEmail(String name, String email);

	// 이름, 아이디, 이메일이 db에 존재하는 지 확인하는 메소드
	Integer existsByNameAndMemberIdAndEmail(String name, String memberId, String email);

	// 정지 여부 확인
	Object checkSuspension(int targetMemberNo);

	// 정지 시키기
	boolean suspendMember(int targetMemberNo);


}
