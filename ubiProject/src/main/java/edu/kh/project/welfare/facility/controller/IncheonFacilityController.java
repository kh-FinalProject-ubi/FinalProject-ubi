package edu.kh.project.welfare.facility.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.IncheonFacility;
import edu.kh.project.welfare.facility.service.IncheonFacilityService;

@RestController
@RequestMapping("/api/incheon-facility")
public class IncheonFacilityController {

    private final IncheonFacilityService facilityService;

    public IncheonFacilityController(IncheonFacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public Map<String, List<IncheonFacility>> getFacilities(
        @RequestParam("city") String city,
        @RequestParam("district") String district,
        @RequestParam(value = "category", required = false) String category
    ) {
        String fullDistrict = city + " " + district;
        List<IncheonFacility> facilities = facilityService.getFacilities(fullDistrict, category);
        return Map.of("data", facilities);
    }
}