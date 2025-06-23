package edu.kh.project.board.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.RowBounds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Pagination;

import edu.kh.project.board.model.mapper.MytownBoardMapper;
import edu.kh.project.member.model.dto.Member;

@Service
public class MytownBoardServiceImpl implements MytownBoardService {


	@Autowired
	private MytownBoardMapper mapper;

	/** 시군구가 동일한 게시글 목록조회 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
	@Override
	public List<Board> selectLocalBoardList(String regionDistrict, String regionCity) {
	    return mapper.selectLocalBoardList(regionDistrict, regionCity);
	}
	
	
    @Override
    public Member login(Member inputMember) {
        return mapper.login(inputMember); // DB에서 조회
    }
@Override
public List<Board> selectLocalBoardList(String regionDistrict, int i) {
	// TODO Auto-generated method stub
	return null;
}


@Override
public Member getMemberByToken(String token) {
    // 실제로는 JWT 파싱하거나 DB에서 토큰 조회
    // 지금은 "dummy-token" 기준으로 더미 유저 반환
    if ("dummy-token".equals(token)) {
        Member member = new Member();
        member.setMemberNo(1);
        member.setMemberId("hong");
        member.setMemberNickname("홍길동");
        member.setMemberStandard("2");
        member.setMemberAddress("서울특별시 강남구");

        return member;
    }

    return null;
}
}
