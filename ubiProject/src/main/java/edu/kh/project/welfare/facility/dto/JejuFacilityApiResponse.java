package edu.kh.project.welfare.facility.dto;

import java.util.List;


import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter

@JsonIgnoreProperties(ignoreUnknown = true) // 이거 추가
@Setter
@NoArgsConstructor
@XmlRootElement(name = "jejunetApi")
@XmlAccessorType(XmlAccessType.FIELD)
public class JejuFacilityApiResponse {

	   @XmlElement(name = "resultCode")
	    private String resultCode;

	    @XmlElement(name = "resultMsg")
	    private String resultMsg;


	    @XmlElementWrapper(name = "items")
	    @XmlElement(name = "item")
	    private List<JejuFacilityResponse> items;
		}
	

