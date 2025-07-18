package edu.kh.project.member.model.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.util.UriComponentsBuilder;

import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.mapper.MemberMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final MemberMapper mapper;
    private final JwtUtil jwtUtil;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String kakaoId = String.valueOf(oauth2User.getAttributes().get("kakaoId"));
        Member member = mapper.selectByKakaoId(kakaoId);

        if (member != null) {
            String token = jwtUtil.generateToken(member);

            String redirectUrl = UriComponentsBuilder
            	    .fromUriString("http://localhost:5173/oauth/kakao/callback")
            	    .queryParam("token", token) // ⛔ memberName, address 제거
            	    .build().toUriString();

            	response.sendRedirect(redirectUrl);
        } else {
            // 신규 사용자
            String redirectUrl = UriComponentsBuilder
                .fromUriString("http://localhost:5173/oauth/kakao/callback")
                .queryParam("kakaoId", kakaoId)
                .build().toUriString();

            response.sendRedirect(redirectUrl);
        }
    }
}