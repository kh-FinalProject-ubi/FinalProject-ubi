package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;
import edu.kh.project.welfare.facility.service.GyeonggiFacilityService;

@RestController
@RequestMapping("/api/gyeonggi-facility")
public class GyeonggiFacilityController {

    private final GyeonggiFacilityService gyeonggiFacilityService;

    @Autowired
    public GyeonggiFacilityController(GyeonggiFacilityService gyeonggiFacilityService) {
        this.gyeonggiFacilityService = gyeonggiFacilityService;
    }

    /**
     * 경기도 복지시설 조회 (노인/아동/공공 등 유형 구분)
     * 예: /api/gyeonggi-facility?city=수원시&district=팔달구&apiType=old
     */
    @GetMapping
    public List<GyeonggiFacility> getFacilities(
            @RequestParam(name = "city") String city,
            @RequestParam(name = "district") String district,
            @RequestParam(name = "apiType", defaultValue = "old") String apiType) {

        return gyeonggiFacilityService.getFacilitiesByRegion(city, district, apiType);
    }
}