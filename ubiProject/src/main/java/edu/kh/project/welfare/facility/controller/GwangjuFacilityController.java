package edu.kh.project.welfare.facility.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.GwangjuFacility;
import edu.kh.project.welfare.facility.service.GwangjuFacilityService;

@RestController
@RequestMapping("/api/gwangju-facility")
public class GwangjuFacilityController {

    private final GwangjuFacilityService facilityService;

    public GwangjuFacilityController(GwangjuFacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public Map<String, List<GwangjuFacility>> getFacilities(
        @RequestParam("city") String city,
        @RequestParam("district") String district,
        @RequestParam(value = "category", required = false) String category
    ) {
        String fullDistrict = city + " " + district;
        List<GwangjuFacility> facilities = facilityService.getFacilities(fullDistrict, category);
        return Map.of("data", facilities);
    }
}
