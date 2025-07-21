package edu.kh.project.welfare.like.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import edu.kh.project.welfare.like.dto.FacilityLike;

@Mapper
public interface WelfareFacilityLikeMapper {

    /** 찜 여부 상태 조회 (JJ_DEL_FL 반환: 'N', 'Y', 또는 null) */
    String selectLikeStatus(FacilityLike dto);

    /** 복지시설 찜 등록 */
    int insertLike(FacilityLike dto);

    /** 찜 복구 (기존에 있던 찜을 다시 활성화) */
    int reactivateLike(FacilityLike dto);

    /** 찜 취소 */
    int deleteLike(FacilityLike dto);
}	