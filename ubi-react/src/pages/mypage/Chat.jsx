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


const Chat = () => {
  const { memberNo, memberName, token } = useAuthStore();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

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

    const newMessage = {
      sender: memberName,
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
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
        "/api/chatting/create",
        { targetMemberNo },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 201 || res.status === 200) {
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
                  key={user.memberNo}
                  className="search-result-item"
                  onClick={() => handleCreateRoom(user.memberNo)}
                >
                  <img src={user.profileImg || "/default-profile.png"} alt="프로필" className="room-profile" />
                  <span>{user.memberNickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 채팅 목록 */}
        {Array.isArray(rooms) && rooms.map((room) => (
          <div
            key={room.roomId}
            className={`chat-room-item ${selectedRoom?.roomId === room.roomId ? "selected" : ""}`}
            onClick={() => handleSelectRoom(room)}
          >
            <img src={room.targetProfile} alt="profile" className="room-profile" />
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