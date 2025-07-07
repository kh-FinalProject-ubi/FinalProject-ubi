package edu.kh.project.websocket.dto;

import edu.kh.project.websocket.type.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDto {

    private Long alertId;          // 알림 식별자 (DB 저장용 - 선택)
    private Long memberNo;         // 알림 대상 회원 번호
    private AlertType type;        // 알림 종류 (Enum) → NOTICE, COMMENT 등
    private String content;        // 알림 내용
    private String targetUrl;      // 알림 클릭 시 이동할 URL
    private String createdAt;      // 알림 생성 시각 (yyyy-MM-dd HH:mm:ss)
    private boolean isRead;

    // 📌 선택적으로 프론트에 icon, label도 보내고 싶다면:
    public String getTypeIcon() {
        return type != null ? type.getIcon() : "";
    }

    public String getTypeLabel() {
        return type != null ? type.getLabel() : "";
    }
}