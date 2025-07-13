package edu.kh.project.websocket.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import edu.kh.project.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

	private final JwtUtil jwtUtil;
	
//    @Override
//    public Message<?> preSend(Message<?> message, MessageChannel channel) {
//        StompHeaderAccessor acc = StompHeaderAccessor.wrap(message);
//        if (StompCommand.CONNECT.equals(acc.getCommand())) {
//        	String auth = acc.getFirstNativeHeader("Authorization");
//        	if (auth != null && auth.startsWith("Bearer ")) {
//        	    String token = auth.substring(7);  // "Bearer "를 제거한 순수 토큰만 추출
//        	    // 이후 token을 이용해 JWT 검증 수행
//        	    boolean valid = jwtUtil.validateToken(token);
//        	    if (!valid) {
//        	        // 유효하지 않은 토큰 처리
//        	    }
//        }
//        }
//        return message;
//    
//    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // "Bearer " 제거
                if (jwtUtil.validateToken(token)) {
                    Authentication auth = jwtUtil.getAuthentication(token);
                    accessor.setUser(auth);
                } else {
                    throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
                }
            } else {
                throw new IllegalArgumentException("Authorization 헤더가 없습니다.");
            }
        }
        return message;
    }
}




