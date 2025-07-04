package edu.kh.project.welfare.facility.service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;

import edu.kh.project.welfare.facility.dto.BusanFacility;

public interface BusanFacilityService {
	List<BusanFacility> getFacilities(String district, String category);
	
	  @Async
	    CompletableFuture<List<BusanFacility>> fetchApi(String url, String districtFilter); // ✅ 추가
}
