package edu.kh.project.member.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import edu.kh.project.board.model.security.CustomUserDetails;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.mapper.MemberMapper;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private MemberMapper memberMapper;

    @Override
    public UserDetails loadUserByUsername(String memberNoStr) throws UsernameNotFoundException {
        long memberNo = Long.parseLong(memberNoStr);
        Member member = memberMapper.selectMemberByNo(memberNo);

        if (member == null) {
            throw new UsernameNotFoundException("회원을 찾을 수 없습니다: " + memberNo);
        }

        return new CustomUserDetails(member);
    }
}