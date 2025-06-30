package edu.kh.project.welfare.like.model.service;

import java.util.List;

import edu.kh.project.welfare.benefits.model.dto.Welfare;

public interface WelfareService {

	void addLike(Welfare dto);

	void cancelLike(Welfare dto);
	
	List<Welfare> selectPopularWelfare();

}
