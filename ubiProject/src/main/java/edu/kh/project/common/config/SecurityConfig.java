package edu.kh.project.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.mapper.MemberMapper;
import edu.kh.project.member.model.service.CustomOAuth2UserService;
import edu.kh.project.member.model.service.OAuth2SuccessHandler;
import org.springframework.security.config.http.SessionCreationPolicy;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

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

            // ✅ 세션 완전 제거: STATELESS 설정
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/**", "/css/**", "/js/**", "/img/**", "/login/**", "/oauth2/**","/kid/**").permitAll()
                .anyRequest().authenticated()
            )

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