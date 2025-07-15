package edu.kh.project.websocket.config;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.kh.project.websocket.handler.ChattingWebsocketHandler;
import edu.kh.project.websocket.handler.TestWebSocketHandler;
import edu.kh.project.websocket.interceptor.AlertWebSocketAuthInterceptor;
import edu.kh.project.websocket.interceptor.ChatWebSocketAuthInterceptor;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import edu.kh.project.common.config.LoggingHandshakeInterceptor;

@CrossOrigin(origins = "*")
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
  private final ChatWebSocketAuthInterceptor interceptor; // 주입

  @PostConstruct
  public void init() {
      System.out.println("✅ WebSocketConfig 등록됨");
  }
  
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-chat")
    		.setAllowedOriginPatterns("*")
    		.withSockJS()
    		.setSessionCookieNeeded(false);
    System.out.println("✅ registerStompEndpoints 등록됨");
  }
  
  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
	  log.info("✅ 메시지 브로커 설정 시작");
    registry.enableSimpleBroker("/queue/", "/topic/", "/user");
    registry.setApplicationDestinationPrefixes("/app");
    registry.setUserDestinationPrefix("/user");
    log.info("✅ 브로커 등록 완료: /queue/, /topic/ /app");
  }

	@Override
	public void configureClientInboundChannel(ChannelRegistration reg) {
	    reg.interceptors(interceptor);
	}
	
	@Override
	public void configureClientOutboundChannel(ChannelRegistration registration) {
	    registration.interceptors(interceptor); // 👈 이걸 반드시 추가
	}
}



