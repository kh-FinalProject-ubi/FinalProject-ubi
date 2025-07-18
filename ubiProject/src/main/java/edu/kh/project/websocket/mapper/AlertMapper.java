package edu.kh.project.websocket.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.project.websocket.dto.Alert;
import edu.kh.project.websocket.dto.AlertDto;

@Mapper
public interface AlertMapper {


    // 알림 목록 조회 (선택사항)
    List<AlertDto> selectAlertList(@Param("memberNo") Long memberNo);
    
    // 알림 읽음 처리 (선택사항)
    int updateIsRead(@Param("alertId") Long alertId);

	void insertAlert(AlertDto alert);

	void insertAlert(Alert alert);
	
	
}