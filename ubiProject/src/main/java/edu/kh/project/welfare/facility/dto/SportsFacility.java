package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class SportsFacility {
	private String facilityName;
    private String facilityAddr;
    private String category;
    private double lat;
    private double lng;
    private String imageUrl;
    private String reservationUrl;
    private String description;
    private String type; // "체육"으로 고정
    
    @JsonProperty("SVCID")
    private String SvcId;

}
