package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.BusanFacility;
import edu.kh.project.welfare.facility.service.BusanFacilityService;

@RestController
@RequestMapping("/api/busan-facility")
public class BusanFacilityController {

	private final BusanFacilityService facilityService;

    public BusanFacilityController(BusanFacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public List<BusanFacility> getFacilities(
        @RequestParam String district,
        @RequestParam String category
    ) {
        return facilityService.getFacilities(district, category);
    }
}