package edu.kh.project.websocket.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDto {

    private Long alertId;       // 알림 식별자
    private Long memberNo;      // 대상 회원 번호
    private String type;        // 알림 종류 (NOTICE, COMMENT 등) ← Enum ❌, String ⭕
    private String content;     // 알림 내용
    private String targetUrl;   // 클릭 시 이동할 URL
    private String createdAt;   // 생성 시각 (yyyy-MM-dd HH:mm:ss)
    private int isRead;     // 읽음 여부 (프론트에 boolean으로 전달)
    private String readAt;      // 읽은 시각 (null이면 안읽음)
    private int boardNo;        // 관련 게시글 번호

    // UI 표시용
    public String getTypeIcon() {
        return switch (type) {
            case "NOTICE" -> "📢";
            case "COMMENT" -> "💬";
            case "QUESTION_REPLY" -> "✅";
            case "WELFARE_UPDATE" -> "🔔";
            default -> "🔔";
        };
    }

    public String getTypeLabel() {
        return switch (type) {
            case "NOTICE" -> "공지";
            case "COMMENT" -> "댓글";
            case "QUESTION_REPLY" -> "답변";
            case "WELFARE_UPDATE" -> "복지 업데이트";
            default -> "알림";
        };
    }
}