import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../styles/mypage/Chat.css";
import useAuthStore from '../../stores/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingOverlay from '../../components/Loading';
import ProfileImgUploader from "./ProfileImgUploader";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';



const Chat = () => {
  console.log("SockJS 타입:", typeof SockJS);
  console.log("SockJS 실제 객체:", SockJS); 
  window.sock = new SockJS("/ws-chat");
  window.sock.onopen = () => console.log("OPEN!");
  window.sock.onclose = () => console.log("CLOSE!");
  window.sock.onerror = (e) => console.log("ERROR", e);
  window.sock.onmessage = (e) => console.log("MESSAGE", e.data);


  const { memberNo, memberName, token } = useAuthStore();
  const stompRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // ✅ 채팅방 목록 불러오기
  const showChat = async () => {
    try {
      const res = await axios.get(`/api/chatting/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        const data = res.data;
        if (Array.isArray(data)) setRooms(data);
        else if (Array.isArray(data.rooms)) setRooms(data.rooms);
        else setRooms([]);
      }
    } catch (error) {
      console.error("채팅 목록 조회 중 예외 발생:", error);
      setRooms([]);
    }
  };

  useEffect(() => {
    if (!memberNo) return;
    showChat();
  }, [memberNo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectRoom = (room) => {
      setSelectedRoom(room);
      setMessages([]); // 새로 초기화
      // TODO: 필요하면 서버에서 메시지 목록 받아오기
    };;

  // ────────── 웹소켓 연결 useEffect ──────────
  useEffect(() => {
    console.log("[CHAT‑USEEFFECT] 실행됨", { token, memberNo });
    if (!token || !memberNo) return;
    
    console.log("[WS‑FACTORY] 호출됨"); 
    // 1) STOMP 클라이언트 생성
    const client = new Client({
      // 프록시(t=5173) → 백엔드(8080)로 전달되도록 상대경로 사용
    webSocketFactory: () => {
      // ① SockJS 인스턴스 생성
      const sock = new SockJS("/ws-chat", null, {
        transports: ["websocket", "xhr-streaming", "xhr-polling"],
        timeout: 30000,
      });

      // ② 연결 URL을 출력하는 다양한 방법 (환경마다 다를 수 있음)
      try {
        console.log("🧪 SockJS URL:", sock._transportUrl || sock.url);
      } catch (e) {
        console.warn("❌ SockJS URL 접근 불가:", e);
      }

      // ③ 전체 SockJS 객체 출력
      console.log("[WS-SOCK]", sock);

      // ④ readyState 상태를 1초 후에 출력
      setTimeout(() => {
        const status = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
        console.log("🧪 SockJS readyState:", sock.readyState, `(${status[sock.readyState] || "UNKNOWN"})`);
      }, 1000);

      // ⑤ 반환 필수
      return sock;
    },

      // 2) 헤더에 JWT 토큰 삽입
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // 3) 자동 재연결 (5초)
      reconnectDelay: 5000,

      // 디버그 로그(원하면 지워도 됨)
      debug: (msg) => console.log("[STOMP]", msg),

      // 4) 연결 후 구독
      onConnect: () => {
        setIsConnected(true);

        client.subscribe(
          `/user/queue/chat/${memberNo}`,         // ★ 서버와 맞춘 구독 경로
          (frame) => {
            const body = JSON.parse(frame.body);
            // 현재 선택된 방의 메시지만 반영
            if (selectedRoom && body.chatRoomNo === selectedRoom.chatRoomNo) {
              setMessages((prev) => [...prev, body]);
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error("STOMP ERROR:", frame);
      },
      onDisconnect: () => setIsConnected(false),
    });

    stompRef.current = client;
    console.log("[DEBUG] stompRef.current 할당됨:", stompRef.current); // 이걸로 확인 가능


    client.activate();

    // 5) 언마운트 시 해제
    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [token, memberNo, selectedRoom]);  // selectedRoom 포함: 방 바꿀 때 재구독



   // 메시지 보내기
  const handleSendMessage = () => {
    if (!input.trim() || !selectedRoom || !isConnected) return;

    const payload = {
      chatRoomNo: selectedRoom.chatRoomNo,
      senderNo: memberNo,
      targetNo: selectedRoom.participant,  // 실제 상대 회원 번호 맞게 바꾸기
      chatContent: input,
      sendTime: new Date().toISOString(),
    };

    stompRef.current.publish({
      destination: '/app/chatting/sendMessage',
      body: JSON.stringify(payload),
    });

    // 낙관적 UI 업데이트
    setMessages(prev => [...prev, {
      senderNo: memberNo,
      chatContent: input,
      sendTime: new Date().toISOString(),
      chatRoomNo: selectedRoom.chatRoomNo,
    }]);

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleSearchMember = async () => {
    if (!searchNickname.trim()) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await axios.get(`/api/chatting/searchMember?memberNickname=${searchNickname}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setSearchResults(res.data);
        console.log("멤버넘버 : ", res.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("회원 검색 실패:", error);
      setSearchResults([]);
    }
    setLoadingSearch(false);
  };

  const handleCreateRoom = async (targetMemberNo) => {
    // 이미 채팅방에 있으면 생성 안 함
    if (rooms.some(room => room.targetNo === targetMemberNo)) {
      alert("이미 채팅방이 존재합니다.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/chatting/create", null, 
        {
          params: { targetMemberNo },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        setShowSearch(false);
        setSearchNickname("");
        setSearchResults([]);
        showChat(); // 목록 다시 불러오기
      }
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
    }
  };
  
  useEffect(() => {
    if (!searchNickname.trim()) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleSearchMember(); // 300ms 이후 검색 실행
    }, 300);

    return () => clearTimeout(debounceTimer); // 이전 요청 취소
  }, [searchNickname]);

  if (!memberNo) return <div>로그인 정보가 없습니다.</div>;
  
console.log("채팅방 목록 : ", rooms);
  return (
    <div>
      <div>연결 상태: {isConnected ? "연결됨" : "연결 안 됨"}</div>
      <div className="chat-wrapper">
        {/* 왼쪽 채팅 목록 */}
        <div className="chat-room-list">
          <div className="chat-list-header">
            <h3>채팅 목록</h3>
            <button onClick={() => setShowSearch(!showSearch)}>+ 추가</button>
          </div>

          {showSearch && (
            <div className="chat-search-box">
              <input
                type="text"
                placeholder="닉네임 검색"
                value={searchNickname}
                onChange={(e) => setSearchNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
              />
              <button onClick={handleSearchMember}>검색</button>
              <div className="search-results">
                {loadingSearch && <div>검색 중...</div>}
                {searchResults.map((user) => (
                  <div
                    key={user.targetNo}
                    className="search-result-item"
                    onClick={() => handleCreateRoom(user.targetNo)}
                  >
                    <img src={user.memberImg || "/default-profile.png"} alt="프로필" className="room-profile" />
                    <span>{user.memberNickname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 채팅 목록 */}
          {Array.isArray(rooms) && rooms.map(room => (
            <div
              key={room.chatRoomNo}                                          // ✔ 방 PK
              className={`chat-room-item ${
                selectedRoom?.chatRoomNo === room.chatRoomNo ? "selected" : ""
              }`}
              onClick={() => handleSelectRoom(room)}
            >
              {/* 프로필 이미지: 값이 없으면 기본 이미지 */}
              <img
                src={room.targetProfile ? `http://localhost:8080${room.targetProfile}` : "/default-profile.png"}
                alt="profile"
                className="room-profile"
                onError={e => { e.currentTarget.src = "/default-profile.png"; }}
              />

              <div className="room-info">
                <div className="room-name">{room.targetNickname}</div>       {/* ✔ Nick N 대문자 */}
                <div className="room-last-message">{room.lastMessage}</div>  {/* maxMessageNo → lastMessage */}
              </div>

              <div className="room-meta">
                <div className="room-time">{room.sendTime}</div>
                {room.notReadCount > 0 && (
                  <div className="room-unread">{room.notReadCount}</div>
                )}
              </div>
            </div>
          ))}
          </div>

        {/* 오른쪽 채팅창 */}
        <div className="chat-container">
          {selectedRoom ? (
            <>
              <div className="chat-header">
                <h2>{selectedRoom.memberName}</h2>
              </div>

              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      msg.sender === memberName ? "my-message" : "other-message"
                    }`}
                  >
                    <div className="message-sender">{msg.sender}</div>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  placeholder="메시지를 입력하세요..."
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button onClick={handleSendMessage}>보내기</button>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">채팅방을 선택하세요</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;