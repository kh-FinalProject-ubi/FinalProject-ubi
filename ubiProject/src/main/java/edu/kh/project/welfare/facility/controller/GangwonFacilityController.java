package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.GangwonFacility;
import edu.kh.project.welfare.facility.service.GangwonFacilityService;

@RestController
@RequestMapping("/api/gangwon-facility")
public class GangwonFacilityController {

    private final GangwonFacilityService gangwonFacilityService;

    @Autowired
    public GangwonFacilityController(GangwonFacilityService gangwonFacilityService) {
        this.gangwonFacilityService = gangwonFacilityService;
    }

    /**
     * 강원도 복지시설 시군 단위 조회
     * ex) /api/gangwon-facility?city=춘천시&district=후평동
     */
    @GetMapping
    public List<GangwonFacility> getFacilities(
            @RequestParam(name = "city") String city,
            @RequestParam(name = "district") String district) {

        return gangwonFacilityService.getFacilitiesByRegion(city, district);
    }
}