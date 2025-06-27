package edu.kh.project.common.util;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

import edu.kh.project.member.model.dto.Member;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;

@Component
@PropertySource("classpath:/config.properties")
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secretKey;
	

	private final long tokenValidityInMs = 1000 * 60 * 60 * 2; // 2시간

	public String generateToken(Member member) {
	    String role = switch (member.getAuthority()) {
	        case "2" -> "ADMIN";
	        case "1" -> "USER";
	        default -> "GUEST";
	    };

	    return Jwts.builder()
	        .claim("memberNo", member.getMemberNo())
	        .claim("role", role)
	        .claim("memberStandard", member.getMemberStandard()) // ✅ 추가
	        .claim("regionCity", member.getRegionCity())         // ✅ 추가
	        .claim("regionDistrict", member.getRegionDistrict()) // ✅ 추가
	        .claim("memberName", member.getMemberNickname())     // ✅ 선택 사항
	        .claim("address", member.getMemberAddress())         // ✅ 선택 사항
	        .setIssuedAt(new Date())
	        .setExpiration(new Date(System.currentTimeMillis() + tokenValidityInMs))
	        .signWith(SignatureAlgorithm.HS256, secretKey)
	        .compact();
	}
	public Long extractMemberNo(String token) {
		Claims claims = Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
		return claims.get("memberNo", Long.class);
	}

	public String extractRole(String token) {
		return getClaims(token).get("role", String.class);
	}

	public boolean validateToken(String token) {
		try {
			Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	private Claims getClaims(String token) {
		return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
	}
}