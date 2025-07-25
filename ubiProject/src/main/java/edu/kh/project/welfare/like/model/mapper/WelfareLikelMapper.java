package edu.kh.project.welfare.like.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.project.welfare.benefits.model.dto.Welfare;

@Mapper
public interface WelfareLikelMapper {

    Welfare selectLike(Welfare dto);

    void insertLike(Welfare dto);

    void reactivateLike(Welfare dto);

    void deleteLike(Welfare dto);
    
    List<Welfare> selectPopularWelfare();
}