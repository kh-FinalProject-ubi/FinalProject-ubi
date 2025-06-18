package edu.kh.project.API.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.kh.project.API.model.dto.SeoulWelfareAPI;
import edu.kh.project.API.model.service.SeoulWelfareService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class SeoulWelfareController {

    private final SeoulWelfareService seoulService;

    @GetMapping
    public List<SeoulWelfareAPI> getAllServices() {
        return seoulService.getAllServices();
    }
    
  
}


