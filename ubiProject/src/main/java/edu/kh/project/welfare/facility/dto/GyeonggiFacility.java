package edu.kh.project.welfare.facility.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class GyeonggiFacility {

	@JsonProperty("FACLT_NM")
	@JsonAlias({"BIZPLC_NM","INST_NM"})	
    private String facilityName;
	
	@JsonProperty("OPEN_FACLT_NM")
	private String openFacltNm;

    @JsonProperty("OPEN_PLC_NM")
    private String placeName;

    @JsonProperty("OPEN_FACLT_TYPE_DIV_NM")
    private String category;

    @JsonProperty("WKDAY_OPERT_BEGIN_TM")
    private String weekdayOpen;

    @JsonProperty("WKDAY_OPERT_END_TM")
    private String weekdayClose;

    @JsonProperty("WKEND_OPERT_BEGIN_TM")
    private String weekendOpen;

    @JsonProperty("WKEND_OPERT_END_TM")
    private String weekendClose;

    @JsonProperty("PAYCHRG_USE_YN")
    private String isPaid;

    @JsonProperty("USE_STD_TM")
    private String useStandardTime;

    @JsonProperty("USE_CHRG")
    private String useCharge;

    @JsonProperty("EXCESS_USE_UNIT_TM")
    private String excessTime;

    @JsonProperty("EXCESS_USE_CHRG")
    private String excessCharge;

    @JsonProperty("ACEPTNC_POSBL_PSN_CNT")
    private String capacity;

    @JsonProperty("FACLT_AR")
    private String area;

    @JsonProperty("SUBFACLT_INFO")
    private String subFacilityInfo;

    @JsonProperty("APLCATN_METH_DIV_NM")
    private String applyMethod;

    @JsonProperty("FACLT_PHOTO_INFO")
    private String imageUrl;

    @JsonProperty("CHARGE_DEPT_NM")
    private String department;

    @JsonProperty("DETAIL_TELNO")
    @JsonAlias({"TELNO_INFO"})	
    private String tel;

    @JsonProperty("HMPG_ADDR")
    @JsonAlias({"HMPG_URL"})	
    private String homepage;

    @JsonProperty("REFINE_ROADNM_ADDR")
    private String refineRoadnmAddr;

    @JsonProperty("REFINE_LOTNO_ADDR")
    private String refineLotnoAddr;

    @JsonProperty("REFINE_WGS84_LAT")
    private String lat;

    @JsonProperty("REFINE_WGS84_LOGT")
    private String lng;

    @JsonProperty("MANAGE_INST_NM")
    private String manageInstNm;

    @JsonProperty("SIGUN_NM")
    private String sigunNm;
    
    private String serviceId; // 서비스 아이디 추가 

    // 내부 주소 기반 필터용
    private String regionCity;
    private String regionDistrict;
    
    private String apiType;
    private String type;          // 서비스 대상 (노인, 아동 등)
   
}