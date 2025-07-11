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
public class ChattingMember {

	private int chatRoomNo;
	private String chatContent;
	private String chatReadDelFl;
	private int senderNo;
	private int targetNo;
	private int No;
	private String lastMessage;
	private int notReadCount;
	private int participant;
	private String sendTime;
	private String targetNickName;
	private String targetProfile;

}
