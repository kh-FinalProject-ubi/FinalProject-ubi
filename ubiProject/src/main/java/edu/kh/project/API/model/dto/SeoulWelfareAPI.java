package edu.kh.project.API.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SeoulWelfareAPI {

    @JsonProperty("SVCID")
    private String apiServiceId;

    @JsonProperty("PLACENM")
    private String agency;

    @JsonProperty("SVCNM")
    private String serviceName;

    @JsonProperty("DTLCONT")
    private String description;

    @JsonProperty("USETGTINFO")
    private String category;

    @JsonProperty("RCPTBGNDT")
    private String receptionStart;

    @JsonProperty("RCPTENDDT")
    private String receptionEnd;

    @JsonProperty("SVCURL")
    private String url;

    @JsonProperty("PAYATNM")
    private String servicePay;

    @JsonProperty("X")
    private String lat;

    @JsonProperty("Y")
    private String lng;

    @JsonProperty("AREANM")
    private String regionDistrict;
}