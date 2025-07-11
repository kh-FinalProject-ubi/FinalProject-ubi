package edu.kh.project.websocket.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.websocket.dto.AlertDto;
import edu.kh.project.websocket.type.AlertType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket을 통해 특정 회원에게 실시간 알림을 전송하는 컨트롤러 (REST API 호출 → WebSocket Push 전송)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/alert")
@Slf4j
public class AlertPushController {

	// Spring에서 제공하는 STOMP 메시지 전송 도구
	private final SimpMessagingTemplate messagingTemplate;

	/**
	 * [POST] /api/alert/push - 특정 회원에게 WebSocket(STOMP) 기반 알림 전송 - 클라이언트는
	 * "/topic/alert/{memberNo}"를 구독 중이어야 수신 가능
	 */
	@PostMapping("/push")
	public void pushAlert(@RequestBody AlertDto alertDto) {

		if (alertDto.getMemberNo() == null) {
			log.error("❌ memberNo 없음 → destination 생성 불가");
			return;
		}

		String destination = "/topic/alert/" + alertDto.getMemberNo();

		// WebSocket을 통해 알림 DTO 전송
		messagingTemplate.convertAndSend(destination, alertDto);
		log.info("✅ WebSocket 알림 전송 완료 → {}", destination);
	}

	@GetMapping("/test")
	public void testAlert() {
		AlertDto alert = AlertDto.builder().memberNo(16L) // ✅ 여기 memberNo는 user03의 번호로 설정
				.type(AlertType.COMMENT).content("테스트 알림입니다").targetUrl("/free/detail/99")
				.createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).isRead(false)
				.build();

		System.out.println("📤 알림 전송 → /topic/alert/16");

		messagingTemplate.convertAndSend("/topic/alert/16", alert);
	}
}
