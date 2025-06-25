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

    /** 카카오 로그인 - 토큰 기반 처리 등 확장 가능 
     * @throws Exception */
    Member kakaoLogin(String authorizationCode) throws Exception;

	String createRandomCode();

	boolean sendAuthCodeToEmail(String email, String authCode);

	boolean checkIdAvailable(String memberId);

	boolean checkNicknameAvailable(String memberNickname);




}
