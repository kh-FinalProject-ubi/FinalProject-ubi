package edu.kh.project.welfare.facility.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import edu.kh.project.welfare.facility.dto.RegionApiInfo;

@Mapper
public interface RegionMapper {
    RegionApiInfo selectApiInfo(@Param("city") String city, @Param("district") String district);
    
    
}
