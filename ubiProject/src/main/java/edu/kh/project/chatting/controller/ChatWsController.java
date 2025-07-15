package edu.kh.project.chatting.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.kh.project.chatting.model.dto.Message;
import edu.kh.project.chatting.model.service.ChattingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@MessageMapping("/chatting")      // STOMP prefix
@RequiredArgsConstructor
@Slf4j
public class ChatWsController {

    private final SimpMessagingTemplate template;
    private final ChattingService service;
    
    
    @MessageMapping("sendMessage")
    public void send(Message msg) {
    	try {
    	log.info("✅ [Controller] 메시지 도착: {}", msg);
    		
    	service.insertMessage(msg);
    	log.info("📥 메시지 DB 저장 완료");
        // 상대에게 1:1로 푸시
    	template.convertAndSend("/queue/chat/" + msg.getTargetNo(), msg);
        log.info("📤 메시지 전송: /queue/chat/{}", msg.getTargetNo());
        // ↔ 혹은 방 브로드캐스트: /topic/room.{roomId}
    	} catch (Exception e) {
    		log.error("❌ 메시지 처리 중 예외 발생", e);
		}
    }
}
