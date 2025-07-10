package edu.kh.project.websocket.interceptor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import edu.kh.project.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertWebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");
                log.info("📌 [WebSocket] 받은 토큰: {}", token);

                if (token != null && token.startsWith("Bearer ")) {
                    boolean valid = jwtUtil.validateToken(token);
                    log.info("✅ [WebSocket] 토큰 유효 여부: {}", valid);

                    if (valid) {
                        Authentication auth = jwtUtil.getAuthentication(token);
                        accessor.setUser(auth);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } else {
                        log.warn("❌ 유효하지 않은 WebSocket JWT 토큰");
                        return null; // 메시지 무시
                    }
                } else {
                    log.warn("❌ Authorization 헤더 누락 또는 Bearer 형식 오류");
                    return null; // 메시지 무시
                }
            }

            return message;
        } catch (Exception e) {
            log.error("❌ WebSocket 인증 중 예외 발생", e);
            return null;
        }
    }
}