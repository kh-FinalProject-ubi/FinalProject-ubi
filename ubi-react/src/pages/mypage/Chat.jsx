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

function ChatPage() {
  // Zustand에서 로그인 유저 정보 가져오기
  const { memberNo } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  const { memberName } = useAuthStore(); // Zustand에서 회원 정보 가져옴

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // 임시 채팅방 목록 데이터
  useEffect(() => {
    // 실제 API 호출 시 memberNo 활용 가능
    const dummyRooms = [
      {
        roomId: 1,
        memberName: "김철수",
        lastMessage: "안녕하세요",
        sendTime: "2025.07.04",
        notReadCount: 2,
        targetProfile: "/images/profile1.png",
      },
      {
        roomId: 2,
        memberName: "이영희",
        lastMessage: "파일 보냈어요",
        sendTime: "2025.07.03",
        notReadCount: 0,
        targetProfile: "/images/profile2.png",
      },
    ];
    setRooms(dummyRooms);
  }, [memberNo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    // 실제로는 서버에서 메시지 불러오기
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

    const newMessage = {
      sender: nickname,
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // 서버로 메시지 보내는 로직 추가 예정
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  if (!memberNo) {
    return <div>로그인 정보가 없습니다.</div>;
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-room-list">
        <h3>채팅 목록</h3>
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className={`chat-room-item ${
              selectedRoom?.roomId === room.roomId ? "selected" : ""
            }`}
            onClick={() => handleSelectRoom(room)}
          >
            <img
              src={room.targetProfile}
              alt="profile"
              className="room-profile"
            />
            <div className="room-info">
              <div className="room-name">{room.memberName}</div>
              <div className="room-last-message">{room.lastMessage}</div>
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
                onKeyPress={handleKeyPress}
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
}

export default ChatPage;
