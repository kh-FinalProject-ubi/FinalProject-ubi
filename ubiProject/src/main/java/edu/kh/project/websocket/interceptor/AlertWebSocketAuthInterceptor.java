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
        log.info("✅ [Interceptor] preSend() 실행됨");

        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
            log.info("🔍 [Interceptor] STOMP Command: {}", accessor.getCommand());

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");
                log.info("📌 [WebSocket] 받은 토큰: {}", token);

                if (token != null && token.startsWith("Bearer ")) {
                    // ✅ 'Bearer ' 접두어 제거
                    token = token.substring(7);

                    boolean valid = jwtUtil.validateToken(token);
                    log.info("✅ [WebSocket] 토큰 유효 여부: {}", valid);

                    if (valid) {
                        Authentication auth = jwtUtil.getAuthentication(token);
                        accessor.setUser(auth);

                        // ✅ 인증 정보가 유지되도록 설정
                        accessor.setLeaveMutable(true);

                        // ✅ SecurityContext에도 등록
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        log.info("✅ [WebSocket] 인증 완료, 사용자 등록됨");
                    } else {
                        log.warn("❌ [WebSocket] 유효하지 않은 JWT 토큰");
                        return null; // 연결 차단
                    }
                } else {
                    log.warn("❌ [WebSocket] Authorization 헤더 누락 또는 Bearer 형식 오류");
                    return null;
                }
            }

            return message;

        } catch (Exception e) {
            log.error("❌ [WebSocket] 인증 중 예외 발생", e);
            return null;
        }
    }
}