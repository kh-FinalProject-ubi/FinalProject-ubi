package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.WelfareFacility;

public interface WelfareFacilityService {
    List<WelfareFacility> getFacilitiesByRegion(String city, String district);
}
