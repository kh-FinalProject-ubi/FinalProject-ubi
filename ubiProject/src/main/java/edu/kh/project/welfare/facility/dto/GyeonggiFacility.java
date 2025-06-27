package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class GyeonggiFacility {
	@JsonProperty("OPEN_FACLT_NM")
    private String facilityName;
	
	@JsonProperty("FACLT_NM")
	private String facilityNm;

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
    
    @JsonProperty("LNGTR_RECPER_APPONT_INST_YN_NM")
    private String lngtrRecperAppontInstYnNm;
    
    @JsonProperty("FACLT_KIND_NM")
    private String facilityKind;

    @JsonProperty("FACLT_PHOTO_INFO")
    private String imageUrl;

    @JsonProperty("HMPG_ADDR")
    private String homepage;
    
    @JsonProperty("SIGUNGU_NM")
    private String sigunguNm;
    
    private String regionCity;    // ex: 경기도
    private String regionDistrict; // ex: 가평군
}
