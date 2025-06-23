package edu.kh.project.member.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.mapper.MemberMapper;
import lombok.extern.slf4j.Slf4j;

@Transactional(rollbackFor = Exception.class)
@Service
@Slf4j
public class MemberServiceImpl implements MemberService {
    @Autowired
    private MemberMapper mapper;
    @Autowired
    private BCryptPasswordEncoder bcrypt;

    @Override
    public Member login(String memberId, String memberPw) {
        Member m = mapper.login(memberId);
        if (m == null) return null;

        boolean isMatch = bcrypt.matches(memberPw, m.getMemberPw());


        if (!isMatch) return null;

        m.setMemberPw(null);
        return m;
    }

    @Override
    public int signup(Member inputMember) {
        // 비밀번호 암호화
        String encryptedPw = bcrypt.encode(inputMember.getMemberPw());
        inputMember.setMemberPw(encryptedPw);

        // 회원가입 처리
        return mapper.signup(inputMember);
    }

    @Override
    public int checkEmail(String memberEmail) {
        return mapper.checkEmail(memberEmail);
    }

    @Override
    public int checkNickname(String memberNickname) {
        return mapper.checkNickname(memberNickname);
    }

    @Override
    public Member kakaoLogin(String kakaoId) {
        // TODO: 카카오 로그인 처리
        return null;
    }
}
