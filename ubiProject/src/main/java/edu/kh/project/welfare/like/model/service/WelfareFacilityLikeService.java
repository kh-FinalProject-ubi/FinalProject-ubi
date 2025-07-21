package edu.kh.project.welfare.like.model.service;

import edu.kh.project.welfare.like.dto.FacilityLike;

public interface WelfareFacilityLikeService {

	/**
     * 복지시설 찜 등록 또는 복구
     * 이미 존재하면 복구(update), 없으면 삽입(insert)
     * @param likeDto 시설 정보
     * @param memberNo 로그인 회원 번호
     * @return true = 찜 상태, false = 찜 해제 상태
     */
    boolean toggleLike(FacilityLike likeDto, Long memberNo);

    /**
     * 찜 여부 확인
     * @return true = 찜 상태, false = 찜 아님
     */
    boolean isLiked(String facilityName, String regionCity, String regionDistrict, Long memberNo);
}
