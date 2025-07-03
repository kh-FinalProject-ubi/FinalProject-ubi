package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.BusanFacility;

public interface BusanFacilityService {
	List<BusanFacility> getFacilities(String district, String category);
}
