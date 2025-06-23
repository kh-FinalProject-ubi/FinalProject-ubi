package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class RegionApiInfo {
	@JsonProperty("DATASET_ID")
    private String datasetId;

    @JsonProperty("UDDI_ID")
    private String uddiId;
    
    @JsonProperty("API_URL")
    private String apiUrl;         // ✅ 전체 URL을 직접 지정하는 필드 추가
}
