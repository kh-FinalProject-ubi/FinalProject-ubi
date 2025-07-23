import useChatAlertStore from "../stores/useChatAlertStore";
import styles from "../styles/mypage/ChattingAlarm.module.css";

export default function ChatAlertModal() {
  const { alarmOpen, closeAlarm, unreadMap } = useChatAlertStore();

  if (!alarmOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={closeAlarm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h4>새 메시지</h4>

        {Object.keys(unreadMap).length === 0 ? (
          <p>새 메시지가 없습니다.</p>
        ) : (
          Object.entries(unreadMap).map(([roomNo, cnt]) => (
            <div
              key={roomNo}
              className={styles.noticeItem}
              onClick={() => {
                closeAlarm();
                // 이미 Chat.jsx 에 있던 handleSelectRoom 호출
                // (필요하면 전역 이벤트나 router navigate 로)
              }}
            >
              <strong>방 #{roomNo}</strong>
              <span className={styles.noticeCnt}>{cnt}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
