package edu.kh.project.welfare.detail.service;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.detail.dto.WelfareDetailMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WelfareDetailServiceImpl implements WelfareDetailService {

    private final WelfareDetailMapper mapper;

    @Override
    public Welfare getDetailByApiServiceId(String apiServiceId) {
        return mapper.selectByApiServiceId(apiServiceId);
    }
}
