package edu.kh.project.common.config;

import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;

import java.util.Map;

	@Component
	public class WebSocketEventListener {
	  private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);
	
	  @EventListener
	  public void handleSessionConnected(SessionConnectEvent event) {
	    log.info("✅ STOMP CONNECTED: headers={}", event.getMessage().getHeaders());
	  }
	
	  @EventListener
	  public void handleSessionDisconnect(SessionDisconnectEvent event) {
	    log.info("🔌 STOMP DISCONNECTED: sessionId={}", event.getSessionId());
	  }
	}
