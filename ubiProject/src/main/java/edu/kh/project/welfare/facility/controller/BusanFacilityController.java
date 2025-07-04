package edu.kh.project.welfare.facility.controller;

import java.util.List;
import java.util.Map;

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
    public Map<String, Object> getFacilities(
        @RequestParam("city") String city,
        @RequestParam("district") String district,
        @RequestParam(value = "category", required = false) String category
    ) {
        String fullDistrict = city + " " + district;
        List<BusanFacility> list = facilityService.getFacilities(fullDistrict, category);
        return Map.of("data", list);  // ✅ 감싸서 전달
    }

}



