package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.JejuFacility;

public interface JejuFacilityService {

	List<JejuFacility> getJejuFacilityList(int page, int size);

}
