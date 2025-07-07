package edu.kh.project.welfare.detail.dto;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WelfareDetailMapper2 {
    Welfare selectByApiServiceId(String apiServiceId);
}