package edu.kh.project.welfare.facility.service;

import java.util.List;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;

public interface GyeonggiFacilityService {
    List<GyeonggiFacility> getGyeonggiFacilities(String city, String district);
}