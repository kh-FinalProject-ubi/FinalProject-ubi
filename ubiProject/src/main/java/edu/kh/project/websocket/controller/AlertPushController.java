package edu.kh.project.websocket.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.websocket.dto.Alert;
import edu.kh.project.websocket.dto.AlertDto;
import edu.kh.project.websocket.mapper.AlertMapper;
import edu.kh.project.websocket.service.AlertService;
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

    private final SimpMessagingTemplate messagingTemplate;
    private final AlertMapper alertMapper;

    private final AlertService alertService;
    /**
     * 알림 전송 요청 시 → DB 저장 후 WebSocket 전송
     */
    @PostMapping("/push")
    public void pushAlert(@RequestBody AlertDto alertDto) {

        if (alertDto.getMemberNo() == null) {
            log.error("❌ memberNo 없음 → destination 생성 불가");
            return;
        }

        // 1. DB 저장용 Alert 엔티티 생성
        Alert alert = Alert.builder()
        	    .memberNo(alertDto.getMemberNo())
        	    .type(alertDto.getType())
        	    .content(alertDto.getContent())
        	    .targetUrl(alertDto.getTargetUrl())
        	    .isRead("N")
        	    .createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
        	    .boardNo(alertDto.getBoardNo())
        	    .build();
        // 2. DB 저장
        alertMapper.insertAlert(alert);

        // 3. 전송용 AlertDto 생성 (저장된 alertId 포함)
        AlertDto resultDto = AlertDto.builder()
                .alertId(alert.getAlertId()) // auto-generated key
                .memberNo(alert.getMemberNo())
                .type(alert.getType())
                .content(alert.getContent())
                .targetUrl(alert.getTargetUrl())
                .createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .isRead(0) // ✅ false 대신 0
                .boardNo(alertDto.getBoardNo())
                .build();

        // 4. WebSocket 전송
        String destination = "/topic/alert/" + alert.getMemberNo();
        messagingTemplate.convertAndSend(destination, resultDto);

        log.info("✅ WebSocket 알림 전송 완료 → {}", destination);
    }

    /**
     * 테스트 알림용
     */
    @GetMapping("/test")
    public void testAlert() {
    	Alert alert = Alert.builder()
                .memberNo(16L)
                .type("COMMENT")
                .content("테스트 알림입니다")
                .targetUrl("/free/detail/99")
                .isRead("N")
                .build();

        alertMapper.insertAlert(alert);

        AlertDto resultDto = AlertDto.builder()
                .alertId(alert.getAlertId())
                .memberNo(alert.getMemberNo())
                .type(alert.getType())
                .content(alert.getContent())
                .targetUrl(alert.getTargetUrl())
                .createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .isRead(0) // ✅ false 대신 0
                .boardNo(99)
                .build();

        messagingTemplate.convertAndSend("/topic/alert/16", resultDto);
        log.info("📤 테스트 알림 전송 → /topic/alert/16");
    }
    
    
    @GetMapping("/list")
    public List<AlertDto> getAlertList(@RequestParam("memberNo") Long memberNo) {
        return alertService.getAlertList(memberNo);
    }
    
    @PutMapping("/read/{alertId}")
    public ResponseEntity<Integer> updateIsRead(@PathVariable("alertId") Long alertId) {
        int result = alertService.updateIsRead(alertId);
        return ResponseEntity.ok(result);
    }
}