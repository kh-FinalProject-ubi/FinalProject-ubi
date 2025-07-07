package edu.kh.project.welfare.detail.service;

import java.util.Map;

import edu.kh.project.welfare.benefits.model.dto.Welfare;

public interface WelfareDetailService {
    Welfare getDetailByApiServiceId(String apiServiceId);
}
