import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "../../styles/mypage/Chat.css";
import useAuthStore from '../../stores/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingOverlay from '../../components/Loading';
import ProfileImgUploader from "./ProfileImgUploader";
import { div } from 'framer-motion/client';
import { stripHtml } from "./striptHtml";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


const Chat = () => {
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
    setMessages([
      {
        sender: room.memberName,
        content: "채팅에 오신 것을 환영합니다.",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSendMessage = () => {
    if (input.trim() === "" || !selectedRoom) return;
    if (!isConnected) {
      alert("WebSocket 연결 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }
    const payload = {
      chatRoomNo: selectedRoom.roomId,
      senderNo: memberNo,
      messageContent: input,
      timestamp: new Date().toISOString(),
    };

    // 🔹 ① 서버로 실시간 전송
    stompRef.current.publish({
      destination: "/app/chatting/sendMessage",   // 서버 @MessageMapping 엔드포인트
      body: JSON.stringify(payload),
    });

    // 🔹 ② 낙관적 UI 반영
    setMessages((prev) => [...prev, { ...payload }]);
    setInput("");
    scrollToBottom();
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

    useEffect(() => {
    if (!memberNo || !token) return; // 로그인 후 실행

    // SockJS → STOMP client
    const socket = new SockJS("/ws");       // 백엔드 WebSocket 엔드포인트
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {                      // JWT 전송 (옵션)
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
          console.log("📡 WebSocket 연결 완료");
          setIsConnected(true);

          client.subscribe(`/queue/chat/${memberNo}`, (msg) => {
            const payload = JSON.parse(msg.body);
            handleIncomingMessage(payload);
          });
        },
      onStompError: (frame) => {
        console.error("STOMP 오류", frame);
      },
    });

    client.activate();
    stompRef.current = client;

    return () => client.deactivate(); // 언마운트 시 연결 해제
  }, [memberNo, token]);

  const handleIncomingMessage = (payload) => {
    /** payload 예시
     * { roomId, senderNo, senderName, content, timestamp }
     */
    // ① 현재 열려 있는 방이면 메시지 목록에 바로 추가
    if (selectedRoom?.roomId === payload.roomId) {
      setMessages((prev) => [...prev, {
        sender: payload.senderName,
        content: payload.content,
        timestamp: payload.timestamp,
      }]);
      scrollToBottom();
    }

    // ② 채팅방 목록 notReadCount 업데이트
    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === payload.roomId
          ? { ...r, lastMessage: payload.content, notReadCount: (r.notReadCount || 0) + (selectedRoom?.roomId === r.roomId ? 0 : 1) }
          : r
      )
    );
  };
  

  return (
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
        {Array.isArray(rooms) && rooms.map((room) => (
          <div
            key={room.memberNo}
            className={`chat-room-item ${selectedRoom?.roomId === room.roomId ? "selected" : ""}`}
            onClick={() => handleSelectRoom(room)}
          >
            <img src={room.memberImg} alt="profile" className="room-profile" />
            <div className="room-info">
              <div className="room-name">{room.memberName}</div>
              <div className="room-last-message">{room.lastMessage}</div>
            </div>
            <div className="room-meta">
              <div className="room-time">{room.sendTime}</div>
              {room.notReadCount > 0 && <div className="room-unread">{room.notReadCount}</div>}
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
  );
};

export default Chat;