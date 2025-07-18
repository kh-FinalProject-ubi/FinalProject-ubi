package edu.kh.project.API.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.kh.project.API.model.dto.SeoulWelfareAPI;


public interface SeoulWelfareService {

	// 서울 복지 서비스 호출 메서드
	List<SeoulWelfareAPI> getAllServices();

}
