package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class RegionApiInfo {
	@JsonProperty("DATASET_ID")
    private String datasetId;

    @JsonProperty("UDDI_ID")
    private String uddiId;
}
