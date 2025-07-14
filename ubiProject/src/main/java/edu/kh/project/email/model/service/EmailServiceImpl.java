package edu.kh.project.email.model.service;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import edu.kh.project.email.model.mapper.EmailMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final EmailMapper mapper;
    private final JavaMailSender mailSender;

    @Override
    public String sendEmail(String htmlName, String email) throws Exception {

        String authKey = createAuthKey();
        log.info("[sendEmail 호출] email={}, type={}", email, htmlName);

        Map<String, String> map = Map.of("authKey", authKey, "email", email);

        if (!storeAuthKey(map)) return null;

        MimeMessage mimeMessage = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[UBI] 인증번호 메일입니다.");
            helper.setText(generateHtmlContent(authKey), true);
            helper.setFrom("noreply@ubi.com", "UBI 관리자");

            helper.addInline("logo", new ClassPathResource("static/images/ubi.png"));

            mailSender.send(mimeMessage);

            return authKey;

        } catch (MessagingException e) {
            e.printStackTrace();
            return null;
        }
    }
    
    private String generateHtmlContent(String authKey) {
        return "<html><body>"
            + "<h2>[UBIPROJECT] 인증번호 안내</h2>"
            + "<p>아래 인증번호를 입력해주세요.</p>"
            + "<h3>" + authKey + "</h3>"
            + "<br><img src='cid:logo' alt='logo' style='width:120px;'/>"
            + "<br><p>감사합니다.</p>"
            + "</body></html>";
    }

	@Transactional(rollbackFor = Exception.class)
    private boolean storeAuthKey(Map<String, String> map) {
        int result = mapper.updateAuthKey(map);
        if (result == 0) {
            result = mapper.insertAuthKey(map);
        }
        return result > 0;
    }

    private String createAuthKey() {
        return UUID.randomUUID().toString().substring(0, 6);
    }

    @Override
    public int checkAuthKey(Map<String, String> map) {
        return mapper.checkAuthKey(map);
    }
}
