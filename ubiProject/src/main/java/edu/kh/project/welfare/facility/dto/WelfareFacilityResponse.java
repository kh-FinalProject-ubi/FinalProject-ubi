package edu.kh.project.welfare.facility.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import lombok.Data;

@JacksonXmlRootElement(localName = "response") // 응답 최상단 XML 태그
@Data
public class WelfareFacilityResponse {

	@JacksonXmlProperty(localName = "body")
    private Body body;

    @Data
    public static class Body {

        @JacksonXmlElementWrapper(localName = "items")
        @JacksonXmlProperty(localName = "item")
        private List<WelfareFacility> items;
    }

    // 실제 데이터를 꺼낼 메서드
    public List<WelfareFacility> getRow() {
        return body != null ? body.items : null;
    }
}