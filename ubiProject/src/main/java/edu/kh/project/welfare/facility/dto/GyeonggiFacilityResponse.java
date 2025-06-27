package edu.kh.project.welfare.facility.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JacksonXmlRootElement(localName = "HtygdWelfaclt") // old용
public class GyeonggiFacilityResponse {

    @JsonProperty("row")
    @JacksonXmlElementWrapper(useWrapping = false) // 중첩 없이 row만 나열됨
    private List<GyeonggiFacility> facilities;
}