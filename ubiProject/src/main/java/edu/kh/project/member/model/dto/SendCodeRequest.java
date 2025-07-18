package edu.kh.project.member.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendCodeRequest {

    private String type;      // 아이디 찾기("id") 또는 비밀번호 찾기("pw")
    private String name;      // 사용자 이름
    private String memberId;  // 멤버 ID (비밀번호 찾기 시 필요)
    private String email;     // 사용자 이메일

}