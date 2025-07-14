package edu.kh.project.welfare.facility.dto;

import lombok.Data;

@Data
public class GangwonFacility {
	private String facilityName;
	private String refineRoadnmAddr;
	private String tel;
	private String lat;
	private String lng;
	private String homepage;
	private String serviceId;
	private String type;
	private String category;
	private String regionCity;
	private String regionDistrict;
	
	private String operatingOrg; // 운영기관명
	private String mealTime;     // 급식시간
}