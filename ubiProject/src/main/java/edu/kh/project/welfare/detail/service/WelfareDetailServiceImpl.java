package edu.kh.project.welfare.detail.service;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.detail.dto.WelfareDetailMapper2;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WelfareDetailServiceImpl implements WelfareDetailService {

    private final WelfareDetailMapper2 mapper;

    @Override
    public Welfare getDetailByApiServiceId(String apiServiceId) {
        return mapper.selectByApiServiceId(apiServiceId);
    }
}
