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

  useEffect(() => {
    console.log("[CHAT‑USEEFFECT] 실행됨", { token, memberNo });
    if (!token || !memberNo) return;

    const client = new Client({
      webSocketFactory: () => {
        const sock = new SockJS("http://localhost:8080/ws-chat", null, {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
          timeout: 30000,
        });

        setTimeout(() => {
          const status = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
          console.log("🧪 SockJS readyState:", sock.readyState, `(${status[sock.readyState] || "UNKNOWN"})`);
        }, 1000);

        return sock;
      },

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      debug: (msg) => console.log("[STOMP]", msg),

      onConnect: (frame) => {
        try {
          console.log("✅ STOMP 연결 성공!", frame);
          setIsConnected(true);

          const destination = `/user/queue/chat/${memberNo}`;
          console.log("📍 구독할 경로:", destination);

          client.subscribe(destination, (message) => {
            try {
              const body = JSON.parse(message.body);
              console.log("📩 받은 메시지:", body);

              if (selectedRoom && body.chatRoomNo === selectedRoom.chatRoomNo) {
                console.log("🎯 현재 선택된 방:", selectedRoom);
                setMessages((prev) => [...prev, body]);
              }
            } catch (err) {
              console.error("❌ 메시지 처리 중 오류:", err);
            }
          });
        } catch (err) {
          console.error("❌ onConnect 내부 오류:", err);
        }
      },

      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame.headers["message"]);
        console.error("❌ 상세 설명:", frame.body);
      },

      onDisconnect: () => {
        console.log("🔌 연결 해제됨");
        setIsConnected(false);
      },
    });

    client.onWebSocketError = (err) => {
      console.error("🌐 WebSocket 오류 발생", err);
    };

    stompRef.current = client;
    console.log("📦 stompRef.current 설정 완료:", client);

    client.activate();
    console.log("🚀 STOMP client.activate() 호출 완료");

    return () => {
      console.log("🧹 클린업 - 연결 해제 시도");
      client.deactivate();
      setIsConnected(false);
    };
  }, [token, memberNo, selectedRoom]);



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