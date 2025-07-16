package edu.kh.project.welfare.facility.service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import edu.kh.project.welfare.facility.dto.IncheonFacility;

public interface IncheonFacilityService {

	List<IncheonFacility> getFacilities(String fullDistrict, String category);

	CompletableFuture<List<IncheonFacility>> fetchApi(String url, String district);

}
