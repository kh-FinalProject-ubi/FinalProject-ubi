package edu.kh.project.websocket.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import edu.kh.project.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor{

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
	    StompHeaderAccessor acc = StompHeaderAccessor.wrap(message);
	    System.out.println("STOMP 커맨드: " + acc.getCommand());
	    System.out.println("헤더 전체: " + acc.toNativeHeaderMap());
	    if (StompCommand.CONNECT.equals(acc.getCommand())) {
	        // 항상 통과
	    }
	    return message;
	}



}
