package edu.kh.project.common.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import edu.kh.project.member.model.dto.Member;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@PropertySource("classpath:/config.properties")
@Slf4j
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secretKey;

	private final UserDetailsService userDetailsService;

	private final long tokenValidityInMs = 1000 * 60 * 60 * 2; // 2시간

	// ✅ 기존 방식 (Member 기반)
	public String generateToken(Member member) {
		String role = switch (member.getAuthority()) {
		case "2" -> "ADMIN";
		case "1" -> "USER";
		default -> "GUEST";
		};

		return Jwts.builder()
				.claim("memberNo", member.getMemberNo())
				.claim("role", role)
				.claim("memberStandard", parseMemberStandard(member.getMemberStandard()))
				.claim("regionCity", member.getRegionCity())
				.claim("regionDistrict", member.getRegionDistrict())
				.claim("memberName", member.getMemberName())
				.claim("memberNickname", member.getMemberNickname())
				.claim("memberImg", member.getMemberImg())
				.claim("address", member.getMemberAddress())
				.claim("taddress", member.getMemberTaddress())
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + tokenValidityInMs))
				.signWith(SignatureAlgorithm.HS256, secretKey)
				.compact();
	}

	// ✅ OAuth2용 : memberNo와 email만으로 JWT 발급
	public String createToken(Long memberNo, String memberEmail) {
		return Jwts.builder()
				.claim("memberNo", memberNo)
				.claim("email", memberEmail)
				.claim("role", "USER") // 기본 사용자 권한
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + tokenValidityInMs))
				.signWith(SignatureAlgorithm.HS256, secretKey)
				.compact();
	}

	// ✅ 나머지 메서드 동일
	public Long extractMemberNo(String token) {
		return getClaims(token).get("memberNo", Long.class);
	}

	public String extractRole(String token) {
		return getClaims(token).get("role", String.class);
	}

	public boolean validateToken(String token) {
		log.info("✅ Loaded secretKey: {}", secretKey);
		try {
			Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
			return true;
		} catch (Exception e) {
			System.out.println("❌ JWT 유효성 검사 실패: " + e.getMessage());
			return false;
		}
	}

	private Claims getClaims(String token) {
		return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
	}

	public Authentication getAuthentication(String token) {
		Long memberNo = extractMemberNo(token);
		UserDetails userDetails = userDetailsService.loadUserByUsername(String.valueOf(memberNo));
		return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
	}

	private String parseMemberStandard(String codeStr) {
		return switch (codeStr) {
		case "1" -> "노인";
		case "2" -> "청년";
		case "3" -> "아동";
		case "4" -> "노인+장애인";
		case "5" -> "청년+장애인";
		case "6" -> "아동+장애인";
		case "7" -> "장애인";
		case "A" -> "임산부";
		case "B" -> "임산부+장애인";
		case "C" -> "임산부+청년";
		case "D" -> "임산부+아동";
		case "E" -> "임산부+노인";
		case "F" -> "임산부+노인+장애인";
		default -> "일반";
		};
	}

}
