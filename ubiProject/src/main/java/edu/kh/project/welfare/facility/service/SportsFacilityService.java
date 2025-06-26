package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.SportsFacility;

public interface SportsFacilityService {
    List<SportsFacility> getFacilitiesByRegion(String district);
}
