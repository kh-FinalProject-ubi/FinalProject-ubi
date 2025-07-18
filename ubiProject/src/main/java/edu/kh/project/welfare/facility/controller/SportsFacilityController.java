package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.SportsFacility;
import edu.kh.project.welfare.facility.service.SportsFacilityService;

@RestController
@RequestMapping("/api/sports-facility")
public class SportsFacilityController {

    private final SportsFacilityService sportsFacilityService;

    private static final Logger logger = LoggerFactory.getLogger(SportsFacilityController.class);

    public SportsFacilityController(SportsFacilityService service) {
        this.sportsFacilityService = service;
    }

    @GetMapping
    public ResponseEntity<List<SportsFacility>> getFacilities(
    		@RequestParam("district") String district) {

        // ✅ 요청 파라미터 확인
        if (district == null || district.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            logger.info("📌 체육시설 조회 요청 - district: {}", district);

            List<SportsFacility> result = sportsFacilityService.getFacilitiesByRegion(district);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("❌ 체육시설 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}