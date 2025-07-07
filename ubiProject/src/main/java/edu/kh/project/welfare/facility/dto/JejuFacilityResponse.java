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
@Setter
@NoArgsConstructor
@XmlRootElement(name = "jejunetApi")
@XmlAccessorType(XmlAccessType.FIELD)
@JsonIgnoreProperties(ignoreUnknown = true) // 👉 이 줄 추가
public class JejuFacilityResponse {

	   @XmlElement(name = "seq")
	    private String seq;

	    @XmlElement(name = "name")
	    private String name;

	    @XmlElement(name = "typeChild")
	    private boolean typeChild;

	    @XmlElement(name = "typeSir")
	    private boolean typeSir;

	    @XmlElement(name = "typeWoman")
	    private boolean typeWoman;

	    @XmlElement(name = "typeObstacle")
	    private boolean typeObstacle;

	    @XmlElement(name = "typeLowIncome")
	    private boolean typeLowIncome;

	    @XmlElement(name = "typeYouth")
	    private boolean typeYouth;

	    @XmlElement(name = "addr")
	    private String addr;

	    @XmlElement(name = "phone")
	    private String phone;

	    @XmlElement(name = "latitude")
	    private String latitude;
	    
	    @XmlElement(name = "longitude")
	    private String longitude;
	
	    
	    @XmlElementWrapper(name = "items")
	    @XmlElement(name = "item")
	    private List<JejuFacilityResponse> items;
	
}
