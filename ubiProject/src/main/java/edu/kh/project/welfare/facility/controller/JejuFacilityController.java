package edu.kh.project.welfare.facility.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.facility.dto.JejuFacility;
import edu.kh.project.welfare.facility.service.JejuFacilityService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/jeju-facility")
public class JejuFacilityController {

	 private final JejuFacilityService welfareApiService;

	    @GetMapping
	    public List<JejuFacility> getFacilities(
	    	    @RequestParam(name = "page", defaultValue = "1") int page,
	    	    @RequestParam(name = "size", defaultValue = "500") int size

	    ) {
	        return welfareApiService.getJejuFacilityList(page, size);
	    }
	
	
}

