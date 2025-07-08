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
public class Message {
	private int chatNo;
    private String chatContent;
    private String chatReadFl;
    private int senderNo;
    private int targetNo;
    private int chatRoomNo;
    private String chatSendDate;
}
