import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import useAuthStore from "../../stores/useAuthStore";
import SockJS from "sockjs-client";

export default function useAlertSocket(memberNo, onAlertReceive) {
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const prevMemberNoRef = useRef(null);
  const token = useAuthStore.getState().token;

  const getWebSocketFactory = () => {
    const isLocal = location.hostname === "localhost";
    const baseUrl = isLocal ? "http://localhost:8080/ws-alert" : "/ws-alert";
    return () => new SockJS(baseUrl);
  };

  const connect = () => {
    if (!Number.isInteger(memberNo) || memberNo <= 0) {
      console.warn("🚫 유효하지 않은 memberNo → WebSocket 연결 생략");
      return;
    }

    try {
      console.log("🔑 전달된 token:", token);

      const client = new Client({
        webSocketFactory: getWebSocketFactory(),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        debug: function (str) {
          console.log("[WebSocket Debug]", str);
        },
        onConnect: () => {
          console.log("🟢 WebSocket 연결 성공");

          // 🔔 개인 알림 (댓글, 문의답변 등)
          const topic = `/topic/alert/${memberNo}`;
          console.log("📍 개인 알림 구독:", topic);

          client.subscribe(topic, (message) => {
            try {
              const alert = JSON.parse(message.body);
              console.log("📩 개인 알림 수신:", alert);

              if (typeof onAlertReceive === "function") {
                onAlertReceive(alert); // COMMENT, INQUIRY_REPLY 모두 포함
              }
            } catch (err) {
              console.error("🚨 메시지 파싱 오류:", err);
            }
          });

          // 📢 공지사항 알림
          const noticeTopic = `/topic/notice/all`;
          console.log("📍 공지사항 알림 구독:", noticeTopic);

          client.subscribe(noticeTopic, (message) => {
            try {
              const alert = JSON.parse(message.body);
              console.log("📢 공지 알림 수신:", alert);

              if (typeof onAlertReceive === "function") {
                onAlertReceive(alert); // NOTICE
              }
            } catch (err) {
              console.error("🚨 공지사항 파싱 오류:", err);
            }
          });
        },
        onWebSocketClose: (evt) => {
          console.warn("⚠️ WebSocket 닫힘", evt);
          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log("🔁 WebSocket 재연결 시도...");
              connect();
              reconnectTimeoutRef.current = null;
            }, 5000);
          }
        },
        onStompError: (frame) => {
          console.error("❌ STOMP 오류:", frame.headers["message"]);
        },
        onDisconnect: () => {
          console.log("🛑 WebSocket 연결 해제됨");
        },
      });

      client.activate();
      stompClientRef.current = client;
    } catch (err) {
      console.error("❌ WebSocket 연결 중 예외:", err);
    }
  };

  useEffect(() => {
    console.log("🔍 useAlertSocket 실행됨. memberNo =", memberNo);

    if (prevMemberNoRef.current === memberNo && stompClientRef.current) {
      console.log("🔁 동일한 memberNo → WebSocket 재연결 생략");
      return;
    }

    prevMemberNoRef.current = memberNo;

    if (stompClientRef.current) {
      console.log("🔄 기존 stompClient 종료");
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    connect();

    return () => {
      console.log("🧹 컴포넌트 언마운트 → stompClient 종료");
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // ❌ 이거 삭제해야 중복 구독 안 됨
      // prevMemberNoRef.current = null;
    };
  }, [memberNo, onAlertReceive, token]);
}
