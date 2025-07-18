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
	public List<WelfareFacility> getFacilityList(@RequestParam("city") String city,
			@RequestParam("district") String district) {
		return facilityService.getFacilitiesByRegion(city, district);
	}
}
