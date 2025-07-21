package edu.kh.project.welfare.like.dto;

import java.util.UUID;

import edu.kh.project.welfare.facility.dto.BusanFacility;
import edu.kh.project.welfare.facility.dto.JejuFacility;
import edu.kh.project.welfare.facility.dto.WelfareFacility;

public class FacilityLikeConverter {

	public static FacilityLike fromBusanFacility(BusanFacility dto, Long memberNo) {
		FacilityLike like = new FacilityLike();
		like.setMemberNo(memberNo);
		like.setFacilityName(dto.getFacilityName());
		like.setRegionCity("부산광역시");
		like.setRegionDistrict(dto.getDistrict());
		like.setCategory(dto.getCategory());
		like.setDescription(dto.getContent() != null ? dto.getContent() : "정보 없음");
		like.setAgency(dto.getManagingAgency());
		like.setFacilityAddr(dto.getAddress());
		like.setLat(dto.getLatitude() != null ? dto.getLatitude().toString() : null);
		like.setLng(dto.getLongitude() != null ? dto.getLongitude().toString() : null);
		like.setFacilityApiServiceId("FAC-" + UUID.randomUUID().toString().substring(0, 8));
		return like;
	}
	
	public static FacilityLike fromWelfareFacility(WelfareFacility dto, long memberNo) {
	    FacilityLike like = new FacilityLike();
	    like.setMemberNo(memberNo);
	    like.setFacilityName(dto.get시설명());
	    like.setRegionCity("서울특별시"); // 고정값
	    like.setRegionDistrict(dto.get자치구구분());
	    like.setCategory(dto.get시설종류명());
	    like.setDescription("정보 없음");
	    like.setAgency(dto.get시설장명() != null ? dto.get시설장명() : "정보 없음");
	    like.setFacilityAddr(dto.get주소());
	    like.setLat(null); // 서울은 위도 없음
	    like.setLng(null);
	    like.setFacilityApiServiceId("FAC-" + UUID.randomUUID().toString().substring(0, 8));
	    return like;
	}
	
	public static FacilityLike fromJejuFacility(JejuFacility dto, long memberNo) {
	    FacilityLike like = new FacilityLike();
	    like.setMemberNo(memberNo);
	    like.setFacilityName(dto.getFacilityName());
	    like.setRegionCity("제주특별자치도"); // 고정
	    like.setRegionDistrict(dto.getDistrict());
	    like.setCategory(dto.getCategory());
	    like.setDescription("정보 없음");
	    like.setAgency("정보 없음"); // JejuFacility에 운영기관 필드 없음
	    like.setFacilityAddr(dto.getAddress());
	    like.setLat(Double.toString(dto.getLatitude()));
	    like.setLng(Double.toString(dto.getLongitude()));
	    like.setFacilityApiServiceId("FAC-" + UUID.randomUUID().toString().substring(0, 8));
	    return like;
	}
}
