package edu.kh.project.chatting.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.bind.annotation.SessionAttributes;

import edu.kh.project.chatting.model.dto.ChattingRoom;
import edu.kh.project.chatting.model.dto.Message;
import edu.kh.project.chatting.model.service.ChattingService;
import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.dto.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("api/chatting")
public class ChattigController {
    
    private final ChattingService service;
    
	private final JwtUtil jwtU;    
	
	private final SimpMessagingTemplate messagingTemplate;
  
    /** 채팅 목록 조회 및 페이지 전환
     * @param loginMember : 현재 로그인한 회원 번호 수집
     * @param model
     * @return
     */
    @GetMapping("list")
    @ResponseBody
    public ResponseEntity<Object> chatting(@RequestHeader("Authorization") String authorizationHeader) {
    	

		try {
			
			if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
		    }

		    String token = authorizationHeader.substring(7);

		    if (!jwtU.validateToken(token)) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
		    }

		    Long memberNoLong = jwtU.extractMemberNo(token);
		    int memberNo = memberNoLong.intValue();
		    
		    List<ChattingRoom> roomList = service.selectRoomList(memberNo);
		    System.out.println("채팅목록 : " + roomList);

		    if (roomList != null) {
		        return ResponseEntity.ok(roomList); // 🔹 새 경로 반환
		    } else {
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("채팅목록 조회 실패");
		    }
			
		} catch (Exception e) {
			
			log.error("채팅목록 조회 중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}

		
	}
    	
    
    // 채팅 상대 검색 - 비동기
    @GetMapping("searchMember")
    @ResponseBody
    public ResponseEntity<Object> selectTarget(@RequestParam("memberNickname") String memberNickname, 
    										   @RequestHeader("Authorization") String authorizationHeader){
    	
    	try {
    		
    		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
		    }

		    String token = authorizationHeader.substring(7);

		    if (!jwtU.validateToken(token)) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
		    }
		    
		    Long memberNoLong = jwtU.extractMemberNo(token);
		    int memberNo = memberNoLong.intValue();
		    
		    log.info("searchMember 호출됨, memberNickname: {}", memberNickname);
		    
		    Map<String, Object> map = new HashMap<>();
		    
		    map.put("memberNickname", memberNickname);
		    map.put("memberNo", memberNo);

		    List<Member> results = service.selectTarget(map);
		    System.out.println(results);

		    if (results != null) {
		        return ResponseEntity.ok(results);
		    } else {
		    	
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("채팅 상대 조회 실패");
		    }
    		
    	}catch (Exception e) {
    		e.printStackTrace(); // 콘솔에 출력
    	    log.error("회원 검색 중 오류 발생", e);
    		
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			
		}
    	
    }
    
    // 채팅방 입장(없으면 생성) - 비동기
    @PostMapping("create")
    @ResponseBody
    public ResponseEntity<Object> chattingEnter(@RequestParam("targetMemberNo") int targetNo, 
    						 @RequestHeader("Authorization") String authorizationHeader) {
     
    	try {
    		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
    		}
    		
    		String token = authorizationHeader.substring(7);
    		
    		if (!jwtU.validateToken(token)) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
    		}
    		
    		Long memberNoLong = jwtU.extractMemberNo(token);
    		int memberNo = memberNoLong.intValue();
    		
    		Map<String, Integer> map = new HashMap<String, Integer>();
    		
    		map.put("targetNo", targetNo);
    		map.put("memberNo", memberNo);
    		
    		log.info("받아온 값 : ", map);
    		
    		// 채팅방번호 체크 서비스 호출 및 반환(기존 생성된 방이 있는지)
    		int chattingNo = service.checkChattingRoomNo(map);
    		
    		
    		// 반환받은 채팅방번호가 0(없다)이라면 생성하기
    		if(chattingNo == 0) {
    			chattingNo = service.createChattingRoom(map);
    		}
    		
    		if (chattingNo > 0) {
 		        return ResponseEntity.ok(chattingNo); // 새 경로 반환
 		    } else {
 		    	
 		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("채팅 상대 조회 실패");
 		    }
    		
    		
    	}catch (Exception e) {
    		e.printStackTrace(); // 콘솔에 출력
    	    log.error("회원 검색 중 오류 발생", e); // 슬프지만 대부분은 이게 빠져 있음
    		
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);    		
		}
    }
    
 
    // 채팅방 목록 조회 - 비동기
    @GetMapping("roomList")
    @ResponseBody
    public List<ChattingRoom> selectRoomList(@SessionAttribute("loginMember") Member loginMember) {
    	return service.selectRoomList(loginMember.getMemberNo());
    }
    
    
    // 메세지 조회 - 비동기
    @GetMapping("messages")
    @ResponseBody
    public ResponseEntity<Object> selectMessageList(@RequestHeader("Authorization") String authorizationHeader,
    												@RequestParam("chatRoomNo") int chatRoomNo) {

    	try {
    		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
    		}
    		
    		String token = authorizationHeader.substring(7);
    		
    		if (!jwtU.validateToken(token)) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
    		}
    		
    		Long memberNoLong = jwtU.extractMemberNo(token);
    		int memberNo = memberNoLong.intValue();
    		
    		Map<String, Integer> map = new HashMap<String, Integer>();
    		
    		map.put("memberNo", memberNo);
    		map.put("chatRoomNo", chatRoomNo);
    		
    		List<Message> message = service.selectMessageList(map);
    		System.out.println("메시지 조회 결과: " + message);
    		
    		if (message != null) {
 		        return ResponseEntity.ok(message); // 새 경로 반환
 		    } else {
 		    	
 		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("채팅 내역 조회 실패");
 		    }
    		
    	}catch (Exception e) {
    		e.printStackTrace(); // 콘솔에 출력
    	    log.error("채팅 내역 조회 실패", e);
    		
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);    		
		}
    }
    
    
    // 채팅 읽음 표시 - 비동기
    @PostMapping("read")
    @ResponseBody
    public ResponseEntity<Object> updateReadFlag(@RequestHeader("Authorization") String authorizationHeader,
							  					 @RequestParam("chatRoomNo") int chatRoomNo) {
    	try {
    		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
    		}
    		
    		String token = authorizationHeader.substring(7);
    		
    		if (!jwtU.validateToken(token)) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
    		}
    		
    		int message = service.updateReadFlag(chatRoomNo);
    		
    		if (message >= 0) {          // ✔︎ 0 row 도 OK
    		    return ResponseEntity.noContent().build();   // 204 No Content
    		}
    		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    		                     .body("채팅 읽음 처리 실패");
    		
    	}catch (Exception e) {
    		e.printStackTrace(); // 콘솔에 출력
    	    log.error("채팅 읽음 조회 실패", e);
    		
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);    		
		}
    }
    
    // 채팅방 나가기
    @PostMapping("/exit")
    @ResponseBody
    public ResponseEntity<Object> exitChatRoom(@RequestParam ("chatRoomNo") int chatRoomNo,
											   @RequestHeader("Authorization") String authorizationHeader) {
    	try {
    		
    		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
    		}
    		
    		String token = authorizationHeader.substring(7);
    		
    		if (!jwtU.validateToken(token)) {
    			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
    		}
    		
    		Long memberNoLong = jwtU.extractMemberNo(token);
    		int memberNo = memberNoLong.intValue();
    		
    		Map<String, Integer> map = new HashMap<String, Integer>();
    		
    		map.put("memberNo", memberNo);
    		map.put("chatRoomNo", chatRoomNo);
    		
    		int message = service.exitChatRoom(map);
    		
    		if (message > 0) {          // ✔︎ 0 row 도 OK
    		    return ResponseEntity.ok(message);
    		}
    		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("채팅 나가기 실패");
    		
    	}catch (Exception e) {
    		e.printStackTrace(); // 콘솔에 출력
    	    log.error("채팅 나가기 실패", e);
    		
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);    		
		}
    }
    
    @PostMapping("/deleteMessage")
    @ResponseBody
    public ResponseEntity<Object> deleteMessage(
            @RequestParam("chatNo") int chatNo,
            @RequestParam("targetNo") int targetNo,
            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
            }

            String token = authorizationHeader.substring(7);
            if (!jwtU.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
            }

            int memberNo = jwtU.extractMemberNo(token).intValue();

            Map<String, Integer> map = new HashMap<>();
            map.put("chatNo", chatNo);
            map.put("memberNo", memberNo);

            int result = service.deleteMessage(map);

            if (result >= 0) {
                // ✅ 삭제된 메시지 정보를 생성 (DB에서 안 가져옴)
                Message deletedMsg = new Message();
                deletedMsg.setChatNo(chatNo);
                deletedMsg.setSenderNo(memberNo);
                deletedMsg.setChatContentDelFl("Y");

                log.warn("💬 삭제 메시지: {}", deletedMsg);
                
                // 🔔 양쪽에게 전송
                messagingTemplate.convertAndSend("/queue/chat/" + memberNo, deletedMsg);
                messagingTemplate.convertAndSend("/queue/chat/" + targetNo, deletedMsg); // 상대방

                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 실패");
            }

        } catch (Exception e) {
            log.error("❌ 메시지 삭제 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    
}