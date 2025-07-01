package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.GangwonFacility;

public interface GangwonFacilityService {

	List<GangwonFacility> getFacilitiesByRegion(String city, String district);

}
