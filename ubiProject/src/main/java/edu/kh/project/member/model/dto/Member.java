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
    private String memberEmail;   		 // 회원 이메일
    private String memberTel;            // 전화번호
    private String memberAddress;        // 주소
    private String memberImg;           // 프로필 이미지
    private String enrollDate;           // 가입일
    private String memberDelFl;          // 탈퇴 여부
    private String authority;            // 권한
    private String memberName;
  
    private String memberTaddress;		 // 회원 임시주소
    private String memberStandard;       // 아동, 청년, 기타 등등..
    
    private int reportCount;  // 신고 누적 횟수
    private String suspendedFl;  // 사용정지여부
    

    // 아래 필드는 프론트 요청 대응 시 주로 사용됨
    private String kakaoId;              // 카카오 로그인 ID (optional)

    // ✅ 지역 정보 추가
    private String regionDistrict; // 예: 강남구
    private String regionCity;     // 예: 서울특별시
	
	
}