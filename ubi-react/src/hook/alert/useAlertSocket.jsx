import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import useAuthStore from "../../stores/useAuthStore"; // ✅ 상태 저장소에서 토큰 꺼냄

export default function useAlertSocket(memberNo, onAlertReceive) {
  const stompClientRef = useRef(null);
  const prevMemberNoRef = useRef(null);

  const token = useAuthStore.getState().token; // ✅ 토큰 가져오기

  useEffect(() => {
    console.log("🔍 useAlertSocket 실행됨. memberNo =", memberNo);

    if (!Number.isInteger(memberNo) || memberNo <= 0) {
      console.warn("🚫 유효하지 않은 memberNo → WebSocket 연결 생략");
      return;
    }

    if (prevMemberNoRef.current === memberNo && stompClientRef.current) {
      console.log("🔁 동일한 memberNo → WebSocket 재연결 생략");
      return;
    }

    prevMemberNoRef.current = memberNo;

    if (stompClientRef.current) {
      console.log("🔄 기존 stompClient 종료");
      stompClientRef.current.deactivate();
    }

    const socket = new SockJS("/ws-alert");
    console.log("✨ SockJS 인스턴스 생성");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,

      connectHeaders: {
        Authorization: `Bearer ${token}`, // ✅ 헤더에 토큰 추가
      },

      onConnect: () => {
        console.log("🟢 WebSocket 연결 성공");

        const topic = `/topic/alert/${memberNo}`;
        console.log("📍 구독 경로:", topic);

        client.subscribe(topic, (message) => {
          console.log("📩 수신된 메시지:", message);
          try {
            const alert = JSON.parse(message.body);
            if (typeof onAlertReceive === "function") {
              onAlertReceive(alert);
            }
          } catch (error) {
            console.error("🚨 메시지 파싱 오류:", error);
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame.headers["message"]);
      },

      onWebSocketClose: (evt) => {
        console.warn("⚠️ WebSocket 닫힘", evt);
      },

      onDisconnect: () => {
        console.log("🛑 WebSocket 연결 해제됨");
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        console.log("🧹 컴포넌트 언마운트 → stompClient 종료");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        prevMemberNoRef.current = null;
      }
    };
  }, [memberNo, onAlertReceive, token]); // ✅ token 의존성 추가
}
