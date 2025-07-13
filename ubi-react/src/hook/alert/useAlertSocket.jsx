// import { useEffect, useRef } from "react";
// import { Client } from "@stomp/stompjs";
// import useAuthStore from "../../stores/useAuthStore";
// import SockJS from "sockjs-client";

// export default function useAlertSocket(memberNo, onAlertReceive) {
//   const stompClientRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const prevMemberNoRef = useRef(null);
//   const token = useAuthStore.getState().token;

//   const connect = () => {
//     if (!Number.isInteger(memberNo) || memberNo <= 0) {
//       console.warn("🚫 유효하지 않은 memberNo → WebSocket 연결 생략");
//       return;
//     }

//     try {
//       console.log("🔑 전달된 token:", token); // ✅ 인코딩 없이 출력

//       const client = new Client({
//         brokerURL: "ws://localhost:8080/ws-alert",
//         connectHeaders: {
//           Authorization: `Bearer ${token}`,
//         },
//         reconnectDelay: 5000,
//         debug: function (str) {
//           console.log("[WebSocket Debug]", str);
//         },
//         onConnect: () => {
//           console.log("🟢 WebSocket 연결 성공");

//           const topic = `/topic/alert/${memberNo}`;
//           console.log("📍 구독 경로:", `/topic/alert/${memberNo}`);

//           client.subscribe(topic, (message) => {
//             console.log("📩 수신된 메시지:", message);
//             try {
//               const alert = JSON.parse(message.body);
//               if (typeof onAlertReceive === "function") {
//                 onAlertReceive(alert);
//               }
//             } catch (err) {
//               console.error("🚨 메시지 파싱 오류:", err);
//             }
//           });
//         },
//         onWebSocketClose: (evt) => {
//           console.warn("⚠️ WebSocket 닫힘", evt);
//           if (!reconnectTimeoutRef.current) {
//             reconnectTimeoutRef.current = setTimeout(() => {
//               console.log("🔁 WebSocket 재연결 시도...");
//               connect();
//               reconnectTimeoutRef.current = null;
//             }, 5000);
//           }
//         },
//         onStompError: (frame) => {
//           console.error("❌ STOMP 오류:", frame.headers["message"]);
//         },
//         onDisconnect: () => {
//           console.log("🛑 WebSocket 연결 해제됨");
//         },
//       });

//       client.activate();
//       stompClientRef.current = client;
//     } catch (err) {
//       console.error("❌ WebSocket 연결 중 예외:", err);
//     }
//   };

//   useEffect(() => {
//     console.log("🔍 useAlertSocket 실행됨. memberNo =", memberNo);

//     if (prevMemberNoRef.current === memberNo && stompClientRef.current) {
//       console.log("🔁 동일한 memberNo → WebSocket 재연결 생략");
//       return;
//     }

//     prevMemberNoRef.current = memberNo;

//     if (stompClientRef.current) {
//       console.log("🔄 기존 stompClient 종료");
//       stompClientRef.current.deactivate();
//       stompClientRef.current = null;
//     }

//     connect();

//     return () => {
//       console.log("🧹 컴포넌트 언마운트 → stompClient 종료");
//       if (stompClientRef.current) {
//         stompClientRef.current.deactivate();
//         stompClientRef.current = null;
//       }
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//         reconnectTimeoutRef.current = null;
//       }
//       prevMemberNoRef.current = null;
//     };
//   }, [memberNo, onAlertReceive, token]);
// }
