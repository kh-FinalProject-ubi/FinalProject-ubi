package edu.kh.project.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import edu.kh.project.websocket.handler.ChattingWebsocketHandler;
import edu.kh.project.websocket.handler.TestWebSocketHandler;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
@EnableWebSocketMessageBroker        // ⭐ STOMP 사용
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final JwtChannelInterceptor jwtChannelInterceptor;
	
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 서버 → 클라이언트 브로커 경로
        registry.enableSimpleBroker("/queue", "/topic");
        // 클라이언트 → 서버 MessageMapping prefix
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS 엔드포인트
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")   // 개발 중 전체 허용
                .withSockJS();
    }
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);  // 여기서 사용
    }
}
	
//	// 웹소켓 핸들러를 등록하는 메서드	
//	@Override
//	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//		registry.addHandler(testWebSocketHandler, "/testSock")
//		// ws://localhost/testSock으로
//		// 클라이언트가 요청을 하면
//		// testWebSocketHandler가 처리하도록 등록
//		.addInterceptors(handshakeInterceptor)
//		// 클라이언트 연결 시 HttpSession을 가로채 핸들러에게 
//		// 전달하는 handshakeInterceptor 등록
//		.setAllowedOriginPatterns("http://localhost/",
//								"http://127.0.0.1", 
//								"http://192.168.50.216/")
//		// 웹소켓 요청이 허용되는 ip/도메인 지정
//		.withSockJS();	// SockJS 지원
//		
//		// ----------------------------------------------
//		
//		registry
//		.addHandler(chattingWebsocketHandler, "/chattingSock")
//		.addInterceptors(handshakeInterceptor)
//		.setAllowedOriginPatterns("http://localhost/",
//								  "http://127.0.0.1", 
//								  "http://192.168.50.216/")
//		
//		.withSockJS();
//		
//	
//	}


