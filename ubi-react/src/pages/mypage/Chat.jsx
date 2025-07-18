import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import useAuthStore from '../../stores/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingOverlay from '../../components/Loading';
import ProfileImgUploader from "./ProfileImgUploader";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import styles from "../../styles/mypage/Chat.module.css";



const Chat = () => {
  console.log("SockJS 타입:", typeof SockJS);
  console.log("SockJS 실제 객체:", SockJS); 

  const { memberNo, memberName, token } = useAuthStore();
  const stompRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const chatMessagesRef = useRef(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTab, setCurrentTab] = useState("list");   // ← 추가

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

  // 채팅내역 조회
  const fetchMessages = async (roomNo) => {
    try {
      const res = await axios.get(`/api/chatting/messages`, {
        params: { chatRoomNo: roomNo },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) return res.data;
    } catch (err) {
      console.error("메시지 조회 실패:", err);
      return[];
    }
  };
  
  const handleSelectRoom = async (room) => {
    // ① 방 선택 상태 업데이트
    setSelectedRoom(room);
    setMessages([]);               // 리스트 비우기(로딩 상태처럼)

    try {
      const list = await fetchMessages(room.chatRoomNo);
      setMessages(list);
    } catch (e) {
      console.error("메시지 조회 실패:", e);
    }

    markAsRead(room.chatRoomNo);
  };

  useEffect(() => {
    console.log("[CHAT‑USEEFFECT] 실행됨", { token, memberNo });
    if (!token || !memberNo) return;
      
    const client = new Client({
      webSocketFactory: () => {
        const sock = new SockJS("/ws-chat", null, {
          transports: ["websocket"], // ✅ fallback까지 허용
          timeout: 30000,
        });

        sock.onopen = () => console.log("WebSocket 연결 성공");
        sock.onclose = () => console.log("WebSocket 연결 종료");
        sock.onerror = (e) => console.log("WebSocket 오류:", e);
        sock.onmessage = (e) => console.log("WebSocket 메시지:", e.data);

        console.log("SockJS readyState:", sock.readyState); // 연결 상태를 로그로 확인

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
        console.log("✅ STOMP 연결 성공!", frame);
        setIsConnected(true);

        const destination = `/user/queue/chat/${memberNo}`;
        console.log("📍 구독할 경로:", destination);

        client.subscribe(destination, (message) => {
          try {
            const body = JSON.parse(message.body);

            if (selectedRoom && body.chatRoomNo === selectedRoom.chatRoomNo) {
              setMessages((prev) => {
                const updated = [...prev];

                const index = updated.findIndex(
                  (msg) =>
                    msg.chatContent === body.chatContent &&
                    msg.senderNo === memberNo &&
                    msg.chatNo && // 💡 보호 코드
                    !msg.chatNo.toString().startsWith("srv_")
                );

                if (index !== -1) {
                  updated[index] = {
                    ...body,
                    chatDelFl: 'N',
                  };
                  return updated;
                }

                return [...prev, { ...body, chatDelFl: 'N' }];
              });
            }
          } catch (err) {
            console.error("STOMP 메시지 처리 중 예외 발생:", err);
          }
        });

      },

      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame.headers["message"]);
        console.error("❌ 상세 설명:", frame.body);
      },

      onDisconnect: () => {
        console.log("🔌 연결 해제됨");
        setIsConnected(false);
      },

      onWebSocketClose: (event) => {
        console.error("🔌 WebSocket Closed", event);
        console.error("이유:", event.reason);  // 종료 사유 확인
        console.error("코드:", event.code);    // 종료 코드 확인
        console.error("정상 종료 여부:", event.wasClean);  // 정상 종료 여부 확인
      },

      onWebSocketError: (error) => {
        console.error("❌ WebSocket Error", error);
      },
    });

    stompRef.current = client;
    console.log("📦 stompRef.current 설정 완료:", client);

    console.log("🚀 STOMP client.activate() 호출 직전");
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
      chatNo: Date.now(), // ✅ 임시 chatNo로 고유값
      senderNo: memberNo,
      chatContent: input,
      chatSendDate: new Date().toISOString(),
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
  
  // 채팅 읽음 표시
  const markAsRead = async (roomNo) => {
     // ✅ 메시지 UI 업데이트
    setMessages(prev =>
      (prev ?? []).map(msg =>
        msg.senderNo !== memberNo && msg.chatReadFl === 'N'
          ? { ...msg, chatReadFl: 'Y' }
          : msg
      )
    );

    setRooms(prev =>
      (prev ?? []).map(room =>
        room.chatRoomNo === roomNo
          ? { ...room, notReadCount: 0 }
          : room
      )
    );

    // 2) 서버 PATCH
    try {
      await axios.post(
        "/api/chatting/read",
        null,
        {
          params: { chatRoomNo: roomNo },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("읽음 처리 실패:", err);
      // 필요하면 롤백 로직 추가
    }
  };

  // 채팅방 나가기
  const handleExitRoom = async (roomNo) => {
    const confirmed = window.confirm("이 채팅방을 나가시겠습니까?");
    if (!confirmed) return;

    try {
      const res = await axios.post("/api/chatting/exit", null, {
        params: { chatRoomNo: roomNo },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        // ✅ 방 목록에서 제거
        setRooms(prev => prev.filter(room => room.chatRoomNo !== roomNo));

        // ✅ 선택되어 있던 방도 초기화
        if (selectedRoom?.chatRoomNo === roomNo) {
          setSelectedRoom(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
      alert("채팅방 나가기 중 오류가 발생했습니다.");
    }
  };

  // 채팅 삭제
  const handleDeleteMessage = async (chatNo) => {
    const confirmDelete = window.confirm("이 메시지를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    console.log("chatNo : ", chatNo);

    try {
      await axios.post("/api/chatting/deleteMessage", null, {
        params: { chatNo },
        headers: { Authorization: `Bearer ${token}` },
      });

      // 프론트에서 상태 업데이트 (soft delete 처리)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.chatNo === chatNo ? { ...msg, chatDelFl: "Y" } : msg
        )
      );

    } catch (err) {
      console.error("메시지 삭제 실패:", err);
      alert("삭제 실패!");
    }
  };

  const scrollToBottom = () => {
    const el = chatMessagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  /* 2. 메시지가 바뀔 때마다 호출 */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* 3. 새로운 방을 열었을 때도 호출(이미 구현돼 있음) */
  useEffect(() => {
    scrollToBottom();
  }, [selectedRoom]);





console.log("채팅방 목록 : ", rooms);
  return (
    <div>
      <div>연결 상태: {isConnected ? "연결됨" : "연결 안 됨"}</div>

      <div className={styles.chatWrapper}>
        {/* --- 왼쪽 채팅 목록 --- */}
        <div className={styles.chatRoomList}>
          <div className={styles.chatListHeader}>
            <h3>채팅 목록</h3>
            <button onClick={() => setShowSearch(!showSearch)}>+ 추가</button>
          </div>

          {showSearch && (
            <div className={styles.chatSearchBox}>
              <input
                type="text"
                placeholder="닉네임 검색"
                value={searchNickname}
                onChange={(e) => setSearchNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
              />
              <button onClick={handleSearchMember}>검색</button>

              <div className={styles.searchResults}>
                {loadingSearch && <div>검색 중...</div>}
                {searchResults.map((user) => (
                  <div
                    key={user.targetNo}
                    className={styles.searchResultItem}
                    onClick={() => handleCreateRoom(user.targetNo)}
                  >
                    <img
                      src={user.memberImg || "/default-profile.png"}
                      alt="프로필"
                      className={styles.roomProfile}
                    />
                    <span>{user.memberNickname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 채팅 목록 */}
          <div className={styles.chatSearchTop}>
            <input
              type="text"
              placeholder="Search"
              value={searchNickname}
              onChange={(e) => setSearchNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
            />
          </div>

          {Array.isArray(rooms) &&
            rooms.map((room) => (
              <div
                key={room.chatRoomNo}
                className={`${styles.chatRoomItem} ${
                  selectedRoom?.chatRoomNo === room.chatRoomNo
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleSelectRoom(room)}
              >
                <img
                  src={
                    room.targetProfile
                      ? `http://localhost:8080${room.targetProfile}`
                      : "/default-profile.png"
                  }
                  alt="profile"
                  className={styles.roomProfile}
                  onError={(e) => {
                    e.currentTarget.src = "/default-profile.png";
                  }}
                />

                <div className={styles.roomInfo}>
                  <div className={styles.roomName}>{room.targetNickname}</div>
                  <div className={styles.roomLastMessage}>{room.lastMessage}</div>
                </div>

                <div className={styles.roomMeta}>
                  <div className={styles.roomTime}>{room.sendTime}</div>
                  {room.notReadCount > 0 && (
                    <div className={styles.roomUnread}>{room.notReadCount}</div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* --- 오른쪽 채팅창 --- */}
        <div className={styles.chatContainer}>
          {selectedRoom ? (
            <>
              {/* 탭바 + 나가기 */}
              <div className={styles.chatTopbar}>
                <div className={`${styles.tab} ${styles.active}`}>채팅 내역</div>
                <div className={styles.tab}>
                  {selectedRoom?.targetNickname || "대화 상대"}
                </div>
                <button
                  className={styles.leaveBtn}
                  onClick={() => handleExitRoom(selectedRoom?.chatRoomNo)}
                >
                  ↩ 채팅 나가기
                </button>
              </div>

              <div className={styles.chatMessages} ref={chatMessagesRef}>
                {messages.map((msg) => {
                  const isMe = msg.senderNo === memberNo;

                  const avatarSrc = isMe
                    ? null
                    : msg.senderProfile
                    ? `http://localhost:8080${msg.senderProfile}`
                    : selectedRoom?.targetProfile
                    ? `http://localhost:8080${selectedRoom.targetProfile}`
                    : "/default-profile.png";

                  const nick =
                    msg.senderNickname ||
                    selectedRoom?.targetNickname ||
                    "상대";

                  return (
                    <div
                      key={msg.chatNo}
                      className={isMe ? styles.my : styles.other}
                    >
                      {!isMe && (
                        <div className={styles.senderName}>{nick}</div>
                      )}

                      <div
                        className={`${styles.chatLine} ${
                          isMe ? styles.my : styles.other
                        }`}
                      >
                        {!isMe && (
                          <img
                            src={avatarSrc}
                            alt=""
                            className={styles.avatar}
                          />
                        )}

                        <div
                          className={`${styles.chatMessage} ${
                            isMe
                              ? styles.myMessage
                              : styles.otherMessage
                          }`}
                        >
                          {msg.chatDelFl === "Y" ? (
                            <i className={styles.deletedMessage}>
                              삭제된 메시지입니다.
                            </i>
                          ) : (
                            <>
                              <span>{msg.chatContent}</span>
                              {isMe && (
                                <button
                                  className={styles.deleteButton}
                                  onClick={() =>
                                    handleDeleteMessage(msg.chatNo)
                                  }
                                >
                                  🗑️
                                </button>
                              )}
                            </>
                          )}
                          <div className={styles.messageTimestamp}>
                            {msg.chatSendDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
              </div>

              <div className={styles.chatInput}>
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
            <div className={styles.chatPlaceholder}>
              채팅방을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default Chat;