package edu.kh.project.chatting.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

            // 💡 여기에 추가!
            if (msg.getChatSendDate() == null) {
            	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            	String nowStr = LocalDateTime.now().format(formatter);
            	msg.setChatSendDate(nowStr);
            }

            service.insertMessage(msg);
            log.info("📥 메시지 DB 저장 완료");

            template.convertAndSend("/queue/chat/" + msg.getTargetNo(), msg);
            template.convertAndSend("/queue/chat/" + msg.getSenderNo(), msg);

        } catch (Exception e) {
            log.error("❌ 메시지 처리 중 예외 발생", e);
        }
    }
    }
