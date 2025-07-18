package edu.kh.project.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    private Long alertId;       // DB에서 auto increment면 생략 가능
    private Long memberNo;
    private String type;        // ex: "COMMENT", "NOTICE"
    private String content;
    private String targetUrl;
    private String isRead;      // 'Y' or 'N'
    private String createdAt;
    private String readAt;
    private int boardNo;
}