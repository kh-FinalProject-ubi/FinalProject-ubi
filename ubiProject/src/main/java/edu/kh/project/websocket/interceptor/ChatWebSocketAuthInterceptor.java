package edu.kh.project.websocket.interceptor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;


import edu.kh.project.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
    	log.info("✅ [Interceptor] preSend() 시작");

        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
            log.info("🔹 Command: {}", accessor.getCommand());
            log.info("🔹 Destination: {}", accessor.getDestination());
            
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            	log.info("🟢 CONNECT 요청 도착");
              
                String token = accessor.getFirstNativeHeader("Authorization");
                log.info("🔐 받은 토큰: {}", token);
                
                if (token != null && token.startsWith("Bearer ")) {
                    // ✅ 'Bearer ' 접두어 제거
                    token = token.substring(7);

                    boolean valid = jwtUtil.validateToken(token);
                    log.info("🔍 토큰 유효성: {}", valid);

                    if (valid) {
                    	System.out.println("✅ 토큰 통과!");
                        Authentication auth = jwtUtil.getAuthentication(token);
                        accessor.setUser(auth);

                        // ✅ 인증 정보가 유지되도록 설정
                        accessor.setLeaveMutable(true);

                        // ✅ SecurityContext에도 등록
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.info("✅ 사용자 인증 및 등록 완료 → {}", auth.getName());
                    } else {
                    	log.warn("❌ Authorization 헤더 없음 또는 형식 오류");
                        return null; // 연결 차단
                    }
                } else {
                    log.warn("❌ [WebSocket] Authorization 헤더 누락 또는 Bearer 형식 오류");
                    return null;
                }
            }

            return message;

        } catch (Exception e) {
        	log.error("❌ Interceptor 예외 발생", e);
            return null;
        }
    }
    
    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        log.info("🧩 [postSend] Command: {}", command);

        if (command == StompCommand.ERROR) {
            log.error("❌ STOMP 연결 중 오류 발생! Headers: {}", accessor.toNativeHeaderMap());
        }

        if (command == StompCommand.CONNECTED) {
            log.info("✅ STOMP 연결 성공!");
        }

        if (command == StompCommand.DISCONNECT) {
            log.info("🔌 클라이언트가 WebSocket 연결 해제함");
        }
    }
    
}