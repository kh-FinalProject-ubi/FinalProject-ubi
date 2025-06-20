package edu.kh.project.member.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Member DTO: DB 연동 및 응답용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    private int memberNo;                 // 회원 번호
    private String memberId;             // 로그인 ID (이메일 X)
    private String memberPw;             // 비밀번호
    private String memberNickname;       // 닉네임
    private String memberTel;            // 전화번호
    private String memberAddress;        // 주소
    private String profileImg;           // 프로필 이미지
    private String enrollDate;           // 가입일
    private String memberDelFl;          // 탈퇴 여부
    private String authority;            // 권한

    // 아래 필드는 프론트 요청 대응 시 주로 사용됨
    private String kakaoId;              // 카카오 로그인 ID (optional)
}