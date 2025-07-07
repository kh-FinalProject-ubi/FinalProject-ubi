package edu.kh.project.websocket.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.websocket.dto.AlertDto;
import lombok.RequiredArgsConstructor;

/**
 * WebSocket을 통해 특정 회원에게 실시간 알림을 전송하는 컨트롤러
 * (REST API 호출 → WebSocket Push 전송)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alert")
public class AlertPushController {

    // Spring에서 제공하는 STOMP 메시지 전송 도구
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * [POST] /api/alert/push
     * - 특정 회원에게 WebSocket(STOMP) 기반 알림 전송
     * - 클라이언트는 "/topic/alert/{memberNo}"를 구독 중이어야 수신 가능
     */
    @PostMapping("/push")
    public void pushAlert(@RequestBody AlertDto alertDto) {

        // ex: "/topic/alert/123" → 123번 회원에게 전송
        String destination = "/topic/alert/" + alertDto.getMemberNo();

        // WebSocket을 통해 알림 DTO 전송
        messagingTemplate.convertAndSend(destination, alertDto);
    }
}
