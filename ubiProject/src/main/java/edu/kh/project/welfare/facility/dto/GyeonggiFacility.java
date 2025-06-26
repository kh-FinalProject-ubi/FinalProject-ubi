package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GyeonggiFacility {
	@JsonProperty("OPEN_FACLT_NM")
    private String facilityName;

    @JsonProperty("OPEN_PLC_NM")
    private String placeName;

    @JsonProperty("OPEN_FACLT_TYPE_DIV_NM")
    private String category;

    @JsonProperty("REFINE_ROADNM_ADDR")
    private String address;

    @JsonProperty("REFINE_WGS84_LAT")
    private String lat;

    @JsonProperty("REFINE_WGS84_LOGT")
    private String lng;

    @JsonProperty("FACLT_PHOTO_INFO")
    private String imageUrl;

    @JsonProperty("HMPG_ADDR")
    private String homepage;
}
