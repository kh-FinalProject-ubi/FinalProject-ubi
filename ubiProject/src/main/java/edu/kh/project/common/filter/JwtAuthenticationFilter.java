package edu.kh.project.common.filter;

import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.member.model.dto.CustomUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("📌 받은 토큰: " + token);

            if (jwtUtil.validateToken(token)) {
                Long memberNo = jwtUtil.extractMemberNo(token);
                String role = jwtUtil.extractRole(token);
                System.out.println("✅ 토큰 유효. memberNo: " + memberNo + ", role: " + role);

                CustomUser customUser = new CustomUser(memberNo.intValue(), role);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(customUser, null, customUser.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                request.setAttribute("memberNo", memberNo.intValue());
                request.setAttribute("role", role);

                System.out.println("✅ SecurityContext 에 사용자 등록 완료");
            } else {
                System.err.println("❌ JWT 유효성 실패");
            }
        } else {
            System.out.println("🔒 Authorization 헤더가 없거나 형식 오류");
        }

        filterChain.doFilter(request, response);
    }
}