package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.BusanFacility;
import edu.kh.project.welfare.facility.dto.GangwonFacility;
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
        @RequestParam("city") String city,
        @RequestParam("district") String district,
        @RequestParam(value = "category", required = false) String category
    ) {
        // 시 + 구군을 합쳐서 지역 전체 문자열로 전달
        String fullDistrict = city + " " + district;
        return facilityService.getFacilities(fullDistrict, category);
    }
}



