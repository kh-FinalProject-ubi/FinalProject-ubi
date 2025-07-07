package edu.kh.project.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class AlertWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // 메시지 브로커 설정 (발행/구독 구조)
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // 클라이언트 구독 prefix (ex: /topic/alert/1) 보내기 = 구독 유튜브 구독같은 느낌의 단어가 아님
        config.setApplicationDestinationPrefixes("/app"); // 클라이언트 송신 prefix
    }

    // STOMP 엔드포인트 설정
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-alert") // 클라이언트가 연결할 WebSocket 엔드포인트
                .setAllowedOriginPatterns("*") // CORS 허용
                .withSockJS(); // SockJS 사용
    }
}