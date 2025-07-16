package edu.kh.project.common.config;

import edu.kh.project.common.filter.JwtAuthenticationFilter;
import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.member.model.service.CustomOAuth2UserService;
import edu.kh.project.member.model.service.OAuth2SuccessHandler;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
    	    .headers(headers -> headers
    	            .frameOptions(frame -> frame.disable()))
    	    .cors(Customizer.withDefaults())
    	    .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 변경
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
            	    .requestMatchers("/ws-chat/**", "/topic/**", "/queue/**", "/user/**").permitAll()
            	    .requestMatchers("/myPage/profile/**").permitAll()
            	    // ✅ 나머지 찜 API는 인증 필요
            	    .requestMatchers("/api/welfare/like/**", "/api/welfare/my-likes").authenticated()
            	    .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll() 
            	    // 댓글 작성, 수정, 삭제는 인증된 사용자(로그인한 사용자)만 가능
            	    .requestMatchers("/api/comments/**").authenticated() 
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
    
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers(
                "/ws-chat/**",    // ✅ 채팅 WebSocket만 제외
                "/topic/**",      // simpleBroker 사용 시 필수
                "/queue/**",      // userQueue 등도 필요
                "/user/**"        // 대상 유저 메시지 처리에 필요
            );
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 개발 클라이언트 주소
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        // WebSocket‑XHR 폴백에 필요한 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Authorization 헤더도 허용
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // 쿠키·Authorization 헤더를 WebSocket/XHR에 실어 보낼 수 있게
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // SockJS가 쓰는 모든 경로 (/ws-chat/**) 에 적용
        source.registerCorsConfiguration("/ws-chat/**", config);
        // 그밖에 REST 요청에도 동일 정책 적용하고 싶으면 ↓
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
