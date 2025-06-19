package edu.kh.project.welfarefacility.mapper;

import java.util.List;

import edu.kh.project.welfarefacility.dto.WelfareFacilityJob;

public interface WelfareFacilityJobMapper {
    void insertWelfareJob(WelfareFacilityJob job);
    List<WelfareFacilityJob> selectAll();
}
