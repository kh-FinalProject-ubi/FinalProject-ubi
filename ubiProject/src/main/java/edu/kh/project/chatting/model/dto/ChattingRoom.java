package edu.kh.project.chatting.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChattingRoom {
	private int chatRoomNo; // 채팅방 번호
    private String lastMessage; // 채팅방의 마지막 메세지
    private String sendTime; // 마지막 메세지 보낸시간
    private int participant; // 채팅방의 대상자 회원 번호
    private String targetNickname; // 채팅방의 대상자 닉네임
    private String targetProfile;  // 채팅방의 대상자 프로필이미지경로
    private int notReadCount; // 채팅방의 읽지않은 메세지 개수
}
