package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WelfareFacilityResponse {

    @JsonProperty("data")
    private List<WelfareFacility> data;

    // 실제 데이터 반환 메서드
    public List<WelfareFacility> getRow() {
        return data;
    }
}