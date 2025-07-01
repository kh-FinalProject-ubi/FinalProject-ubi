package edu.kh.project.welfare.facility.controller;

import java.util.ArrayList;
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
	 * 경기도 복지시설 전체 유형(old, child, public) 조회 프론트 요청 예:
	 * /api/gyeonggi-facility?city=성남시&district=분당구
	 */
	@GetMapping
	public List<GyeonggiFacility> getAllFacilities(@RequestParam(name = "city") String city,
			@RequestParam(name = "district") String district) {

		List<GyeonggiFacility> result = new ArrayList<>();

		// 전체 유형을 순회하면서 결과 누적
		String[] apiTypes = { "old", "child", "public" };
		for (String type : apiTypes) {
			List<GyeonggiFacility> facilities = gyeonggiFacilityService.getFacilitiesByRegion(city, district);
			result.addAll(facilities);
		}

		return result;
	}
}