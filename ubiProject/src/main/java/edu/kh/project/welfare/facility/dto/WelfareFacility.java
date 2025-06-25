package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WelfareFacility {

    // 공통 가능 필드 (한글/영문 혼용 대응)
	
	  @JacksonXmlProperty(localName = "FCLT_NM")
	    private String 시설명;

	    @JacksonXmlProperty(localName = "FCLT_CD")
	    private String 시설코드;

	    @JacksonXmlProperty(localName = "FCLT_KIND_NM")
	    private String 시설종류명;

	    @JacksonXmlProperty(localName = "FCLT_KIND_DTL_NM")
	    private String 시설종류상세명;

	    @JacksonXmlProperty(localName = "JRSD_SGG_SE")
	    private String 자치구구분;

	    @JacksonXmlProperty(localName = "RPRSNTV")
	    private String 시설장명;

	    @JacksonXmlProperty(localName = "JRSD_SGG_CD")
	    private String 시군구코드;

	    @JacksonXmlProperty(localName = "JRSD_SGG_NM")
	    private String 시군구명;

	    @JacksonXmlProperty(localName = "FCLT_ADDR")
	    private String 주소;

	    @JacksonXmlProperty(localName = "INMT_GRDN_CNT")
	    private String 정원;

	    @JacksonXmlProperty(localName = "LVLH_NMPR")
	    private String 현원;

	    @JacksonXmlProperty(localName = "FCLT_TEL_NO")
	    private String 전화번호;

	    @JacksonXmlProperty(localName = "FCLT_ZIPCD")
	    private String 우편번호;

    // 기타 API 특성에 따라 필요한 컬럼은 자유롭게 확장 가능
}