package edu.kh.project.email.controller;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import edu.kh.project.email.model.service.EmailService;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("email")
@RequiredArgsConstructor
public class EmailController {

	private final EmailService service;
	
	@ResponseBody
	@PostMapping("signup")
	public int signup(@RequestBody String email) throws Exception {
		
		String authKey = service.sendEmail("signup", email);
		
		if(authKey != null) { // 인증번호 발급 성공 & email 보내기 성공
			return 1;
		}

		// 이메일 보내기 실패
		return 0;
	}

	/** 입력받은 이메일, 인증번호가 DB에 있는 지 조회
	 * @param map (email, authKey)
	 * @return 1 : 이메일, 인증번호 일치 / 0 : 없을 때
	 */
	@ResponseBody
	@PostMapping("checkAuthKey")
	public int checkAuthKey(@RequestBody Map<String, String> map) {
		return service.checkAuthKey(map);
	}

}
