package edu.kh.project.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import edu.kh.project.websocket.handler.ChattingWebsocketHandler;
import edu.kh.project.websocket.handler.TestWebSocketHandler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import edu.kh.project.common.config.LoggingHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
  private final JwtChannelInterceptor jwtChannelInterceptor; // 주입
	
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-chat")
    		.setAllowedOrigins("*")
    		.withSockJS();
  }
  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/queue/", "/topic/");
    registry.setApplicationDestinationPrefixes("/app");
  }

	@Override
	public void configureClientInboundChannel(ChannelRegistration reg) {
	    reg.interceptors(jwtChannelInterceptor);
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


