package edu.kh.project.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import edu.kh.project.common.filter.JwtAuthenticationFilter;
import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.member.model.service.CustomOAuth2UserService;
import edu.kh.project.member.model.service.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;

import org.springframework.security.config.http.SessionCreationPolicy;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public OAuth2SuccessHandler successHandler(MemberMapper mapper, JwtUtil jwtUtil) {
        return new OAuth2SuccessHandler(mapper, jwtUtil);
    }
	
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                            CustomOAuth2UserService oAuth2UserService,
                                            OAuth2SuccessHandler successHandler) throws Exception {
        http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/", "/css/**", "/js/**", "/img/**", "/images/**", "/images/board/**",
                "/login/**", "/oauth2/**", "/kid/**"
            ).permitAll()

            // 여기에 찜 관련 API 보호
            .requestMatchers("/api/welfare/like", "/api/welfare/my-likes").authenticated()
            .anyRequest().permitAll()
        )

        // ✅ JWT 필터 등록
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

        // ✅ OAuth2 로그인 그대로 유지
        .oauth2Login(oauth -> oauth
            .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
            .successHandler(successHandler)
        );

        return http.build();
    }
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}