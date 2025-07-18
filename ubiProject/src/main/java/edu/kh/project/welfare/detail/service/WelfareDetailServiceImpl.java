package edu.kh.project.welfare.detail.service;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.detail.dto.WelfareDetailMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WelfareDetailServiceImpl implements WelfareDetailService {

    private final WelfareDetailMapper mapper;

    @Override
    public Welfare getDetailByApiServiceId(String apiServiceId) {
        return mapper.selectByApiServiceId(apiServiceId);
    }
}
