import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function useAlertSocket(memberNo, onAlertReceive) {
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!memberNo) return;

    // WebSocket 연결 생성
    const socket = new SockJS("/ws-alert");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // 연결 끊겼을 때 재시도 딜레이
      onConnect: () => {
        console.log("🟢 WebSocket 연결됨");

        // 해당 사용자 채널 구독
        client.subscribe(`/topic/alert/${memberNo}`, (message) => {
          const alert = JSON.parse(message.body);
          console.log("🔔 알림 수신:", alert);

          if (typeof onAlertReceive === "function") {
            onAlertReceive(alert); // 부모 컴포넌트로 전달
          }
        });
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame.headers["message"]);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [memberNo, onAlertReceive]);
}
