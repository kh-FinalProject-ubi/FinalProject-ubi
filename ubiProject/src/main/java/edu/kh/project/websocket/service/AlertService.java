package edu.kh.project.websocket.service;

import java.util.List;

import edu.kh.project.websocket.dto.AlertDto;

public interface AlertService {
    void sendAlert(AlertDto alertDto);

	void sendAlert(long longValue, String string, String string2, int boardNo, String string3);
	
	List<AlertDto> getAlertList(Long memberNo);

	int updateIsRead(Long alertId);
}

