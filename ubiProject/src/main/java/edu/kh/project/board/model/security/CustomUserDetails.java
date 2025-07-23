package edu.kh.project.board.model.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import edu.kh.project.member.model.dto.Member;
import lombok.Data;

@Data
public class CustomUserDetails implements UserDetails {
	
	private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }
    
    public Long getMemberNo() {
    	
    	 return (long) member.getMemberNo();
    }


    @Override
    public String getUsername() {
        return String.valueOf(member.getMemberNo()); // memberNo를 username처럼 사용
    }

    @Override
    public String getPassword() {
        return member.getMemberPw(); // 비밀번호 필요 시
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // 권한 관리가 필요하다면 추가
    }
}

