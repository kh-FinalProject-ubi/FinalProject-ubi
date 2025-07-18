package edu.kh.project.welfare.facility.service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;

import edu.kh.project.welfare.facility.dto.GwangjuFacility;



public interface GwangjuFacilityService {

	List<GwangjuFacility> getFacilities(String fullDistrict, String category);
	
	@Async
    CompletableFuture<List<GwangjuFacility>> fetchApi(String url, String districtFilter);
}
