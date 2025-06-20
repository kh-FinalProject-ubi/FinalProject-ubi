package edu.kh.project.welfare.job.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.welfare.job.dto.WelfareFacilityJob;
import edu.kh.project.welfare.job.service.WelfareFacilityJobService;
import lombok.RequiredArgsConstructor;




@RestController
@RequestMapping("/api/facilityjob")
@RequiredArgsConstructor 
public class WelfareFacilityJobController {



    private final WelfareFacilityJobService service;

    @GetMapping
    public List<WelfareFacilityJob> getAllJobs() throws Exception {
    	 return service.getAllJobs();
    }



}