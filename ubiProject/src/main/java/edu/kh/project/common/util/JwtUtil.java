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
	        default  -> "일반";
	    };
	}
	

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
	        .claim("memberStandard", parseMemberStandard(member.getMemberStandard())) // ✅ 여기
	        .claim("regionCity", member.getRegionCity())         // ✅ 추가
	        .claim("regionDistrict", member.getRegionDistrict()) // ✅ 추가
	        .claim("memberName", member.getMemberName())     // ✅ 선택 사항
	        .claim("memberNickname", member.getMemberNickname())     // ✅ 선택 사항
	        .claim("memberImg", member.getMemberImg())     // ✅ 선택 사항
	        .claim("address", member.getMemberAddress())         // ✅ 선택 사항
	        .claim("taddress", member.getMemberTaddress()) // ✅ taddress 포함
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
	        Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token); // 🔍 여기서 오류날 수도 있음
	        return true;
	    } catch (Exception e) {
	        System.out.println("❌ JWT 유효성 검사 실패: " + e.getMessage());
	        return false;
	    }
	}

	private Claims getClaims(String token) {
		return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
	}
}