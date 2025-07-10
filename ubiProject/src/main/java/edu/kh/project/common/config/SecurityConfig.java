package edu.kh.project.common.config;

import edu.kh.project.common.filter.JwtAuthenticationFilter;
import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.member.model.service.CustomOAuth2UserService;
import edu.kh.project.member.model.service.OAuth2SuccessHandler;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * OAuth2 성공 시 사용자 DB 조회 후 JWT 발급
     */
    @Bean
    public OAuth2SuccessHandler successHandler(MemberMapper mapper, JwtUtil jwtUtil) {
        return new OAuth2SuccessHandler(mapper, jwtUtil);
    }

    /**
     * Spring Security 보안 설정
     */
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            CustomOAuth2UserService oAuth2UserService,
            OAuth2SuccessHandler successHandler
    ) throws Exception {

        http
            // ✅ 세션 사용 안 함 (JWT 기반)
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ✅ 인증/인가 실패 시 JSON 응답 반환
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\": \"Unauthorized\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\": \"Access Denied\"}");
                })
            )

            // ✅ 경로별 인증 설정
            .authorizeHttpRequests(auth -> auth
            	    .requestMatchers("/", "/css/**", "/js/**", "/img/**", "/images/**", "/images/board/**").permitAll()
            	    .requestMatchers("/login/**", "/oauth2/**", "/kid/**").permitAll()

            	    // ✅ 인기 복지혜택만 예외적으로 허용
            	    .requestMatchers("/api/welfare/like/popular").permitAll()
            	    .requestMatchers("/api/welfare-curl/welfare-detail").permitAll()
            	    .requestMatchers("/api/welfare-curl/**").permitAll()
            	    .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            	    .requestMatchers("/ws-alert/**", "/topic/**").permitAll()
            	    // ✅ 나머지 찜 API는 인증 필요
            	    .requestMatchers("/api/welfare/like/**", "/api/welfare/my-likes").authenticated()

            	    .anyRequest().permitAll()
            	)

            // ✅ JWT 필터 등록: UsernamePasswordAuthenticationFilter 이전에 실행되도록
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // ✅ OAuth2 로그인 설정
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo -> userInfo.userService(oAuth2UserService))
                .successHandler(successHandler)
            );

        return http.build();
    }

    /**
     * 비밀번호 암호화기 등록
     */
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
