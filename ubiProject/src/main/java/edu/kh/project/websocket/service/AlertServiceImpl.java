package edu.kh.project.websocket.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import edu.kh.project.websocket.dto.Alert;
import edu.kh.project.websocket.dto.AlertDto;
import edu.kh.project.websocket.mapper.AlertMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {

    private final AlertMapper alertMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendAlert(AlertDto alertDto) {

        // ✅ DB 저장용 Alert 엔티티 생성 (isRead = "N")
        Alert alert = Alert.builder()
                .memberNo(alertDto.getMemberNo())
                .type(alertDto.getType()) // 문자열로 받음
                .content(alertDto.getContent())
                .targetUrl(alertDto.getTargetUrl())
                .isRead("N")
                .build();

        // ✅ DB 저장
        alertMapper.insertAlert(alert);

        // ✅ WebSocket 전송용 AlertDto 구성
        AlertDto dto = AlertDto.builder()
                .alertId(alert.getAlertId())
                .memberNo(alert.getMemberNo())
                .type(alert.getType()) // 문자열
                .content(alert.getContent())
                .targetUrl(alert.getTargetUrl())
                .createdAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .isRead(false)
                .boardNo(alertDto.getBoardNo())
                .build();

        String destination = "/topic/alert/" + dto.getMemberNo();
        messagingTemplate.convertAndSend(destination, dto);

        log.info("✅ WebSocket 알림 전송 완료 to {}, type = {}", dto.getMemberNo(), dto.getType());
    }

    @Override
    public void sendAlert(long memberNo, String content, String targetUrl, int boardNo, String type) {
        AlertDto dto = AlertDto.builder()
            .memberNo(memberNo)
            .content(content)
            .targetUrl(targetUrl)
            .boardNo(boardNo)
            .type(type)
            .build();

        sendAlert(dto); // 기존 AlertDto 버전 메서드 호출
    }
    
    @Override
    public List<AlertDto> getAlertList(Long memberNo) {
        return alertMapper.selectAlertList(memberNo);
    }

    
}