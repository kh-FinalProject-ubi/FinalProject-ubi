package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.WelfareFacility;
import edu.kh.project.welfare.facility.service.WelfareFacilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/facility")
@RequiredArgsConstructor
@Slf4j
public class WelfareFacilityController {

    private final WelfareFacilityService facilityService;

    @GetMapping
    public List<WelfareFacility> getFacilities(
            @RequestParam("city") String city,
            @RequestParam("district") String district
    ) {
    	// 기본값 지정
        if (city == null || city.trim().isEmpty()) {
            city = "서울특별시";
        }
        if (district == null || district.trim().isEmpty()) {
            district = "종로구";
        }

        log.debug("도시(city): '{}'", city);
        log.debug("구(district): '{}'", district);
        return facilityService.getFacilitiesByRegion(city, district);
    }
}
