package edu.kh.project.welfare.detail.dto;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WelfareDetailMapper {
    Welfare selectByApiServiceId(@Param("apiServiceId") String apiServiceId);
}