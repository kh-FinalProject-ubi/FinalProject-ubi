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

    @GetMapping
    public List<GyeonggiFacility> getFacilities(
            @RequestParam(defaultValue = "수원시") String city,
            @RequestParam(defaultValue = "팔달구") String district) {

        return gyeonggiFacilityService.getGyeonggiFacilities(city, district);
    }
}