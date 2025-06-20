package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import lombok.Data;

@Data
public class WelfareFacility {
    @JacksonXmlProperty(localName = "SIGUN_CD")
    private String SIGUN_CD;

    @JacksonXmlProperty(localName = "SIGUN_NM")
    private String SIGUN_NM;

    @JacksonXmlProperty(localName = "FACLT_NM")
    private String FACLT_NM;

    @JacksonXmlProperty(localName = "REFINE_ROADNM_ADDR")
    private String REFINE_ROADNM_ADDR;

    @JacksonXmlProperty(localName = "REFINE_LOTNO_ADDR")
    private String REFINE_LOTNO_ADDR;

    @JacksonXmlProperty(localName = "REFINE_ZIP_CD")
    private String REFINE_ZIP_CD;

    @JacksonXmlProperty(localName = "DETAIL_TELNO")
    private String DETAIL_TELNO;

    @JacksonXmlProperty(localName = "DETAIL_FAXNO")
    private String DETAIL_FAXNO;

    @JacksonXmlProperty(localName = "USE_MBER_CNT")
    private Integer USE_MBER_CNT;

    @JacksonXmlProperty(localName = "ENFLPSN_PSN_CAPA")
    private Integer ENFLPSN_PSN_CAPA;

    @JacksonXmlProperty(localName = "ENFLPSN_PSTPSN_SUM")
    private Integer ENFLPSN_PSTPSN_SUM;

    @JacksonXmlProperty(localName = "ENFLPSN_PSTPSN_MALE_CNT")
    private Integer ENFLPSN_PSTPSN_MALE_CNT;

    @JacksonXmlProperty(localName = "ENFLPSN_PSTPSN_FEMALE_CNT")
    private Integer ENFLPSN_PSTPSN_FEMALE_CNT;

    @JacksonXmlProperty(localName = "ENFLPSN_PSTPSN_RGLLBR_CNT")
    private Integer ENFLPSN_PSTPSN_RGLLBR_CNT;

    @JacksonXmlProperty(localName = "ENFLPSN_PSTPSN_IRGLLBR_CNT")
    private Integer ENFLPSN_PSTPSN_IRGLLBR_CNT;

    @JacksonXmlProperty(localName = "FACLT_INSTL_DETAIL_DE")
    private String FACLT_INSTL_DETAIL_DE;

    @JacksonXmlProperty(localName = "LOCGOV_INSTL_DIV_NM")
    private String LOCGOV_INSTL_DIV_NM;

    @JacksonXmlProperty(localName = "PRVATE_INSTL_DIV_NM")
    private String PRVATE_INSTL_DIV_NM;

    @JacksonXmlProperty(localName = "INSTL_MAINBD_DIV_NM")
    private String INSTL_MAINBD_DIV_NM;

    @JacksonXmlProperty(localName = "COPRTN_GRP_NM")
    private String COPRTN_GRP_NM;

    @JacksonXmlProperty(localName = "RM")
    private String RM;

    @JacksonXmlProperty(localName = "REFINE_WGS84_LAT")
    private Double REFINE_WGS84_LAT;

    @JacksonXmlProperty(localName = "REFINE_WGS84_LOGT")
    private Double REFINE_WGS84_LOGT;
}
