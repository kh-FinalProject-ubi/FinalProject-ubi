import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/**
 * WebSocket 알림 수신 후크
 * @param {number} memberNo - 현재 로그인한 회원 번호
 * @param {function} onAlertReceive - 알림 수신 시 실행할 코백 함수
 */
export default function useAlertSocket(memberNo, onAlertReceive) {
  const stompClientRef = useRef(null);

  useEffect(() => {
    console.log("\uD83D\uDD0D useAlertSocket 실행됨. memberNo =", memberNo);

    if (!memberNo) {
      console.warn(
        "\uD83D\uDEAB memberNo 없음 \u2192 WebSocket 건설 시도 안 함"
      );
      return;
    }

    // 이미 건설된 클라이언트가 있으면 먼저 종료
    if (stompClientRef.current) {
      console.log("\uD83D\uDD04 기존 stompClient 종료");
      stompClientRef.current.deactivate();
    }

    const socket = new SockJS("/ws-alert");
    console.log("\u2728 SockJS 건설 시도");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("\uD83D\uDFE2 WebSocket \uac74설됨");

        const topic = `/topic/alert/${memberNo}`;
        console.log("\uD83D\uDCCC 구독 경로:", topic);

        client.subscribe(topic, (message) => {
          console.log("\uD83D\uDD14 구독 목록 message: ", message);
          const alert = JSON.parse(message.body);
          console.log("\uD83D\uDD14 알림 수신:", alert);

          if (typeof onAlertReceive === "function") {
            onAlertReceive(alert);
          }
        });
      },
      onStompError: (frame) => {
        console.error("\u274C STOMP 오류:", frame.headers["message"]);
      },
      onWebSocketClose: (evt) => {
        console.warn("\u26A0 WebSocket 건설 종료됨", evt);
      },
      onDisconnect: () => {
        console.warn("\u26A0 STOMP 건설 해제됨");
      },
    });

    client.activate();
    stompClientRef.current = client;

    // 어린 커튼 종료 시 건설 해제
    return () => {
      if (stompClientRef.current) {
        console.log("\uD83E\uDDF9 WebSocket 정리 \u2192 stompClient 종료");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [memberNo, onAlertReceive]);
}
