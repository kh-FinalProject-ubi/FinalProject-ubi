package edu.kh.project.member.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.project.member.model.dto.Member;
import edu.kh.project.member.model.mapper.MemberMapper;
import lombok.extern.slf4j.Slf4j;

@Transactional(rollbackFor = Exception.class)
@Service
@Slf4j
public class MemberServiceImpl implements MemberService {
    @Autowired
    private MemberMapper mapper;
    @Autowired
    private BCryptPasswordEncoder bcrypt;

    @Override
    public Member login(String memberId, String memberPw) {
        Member m = mapper.login(memberId);
        if (m == null) return null;

        boolean isMatch = bcrypt.matches(memberPw, m.getMemberPw());


        if (!isMatch) return null;

        m.setMemberPw(null);
        return m;
    }

    @Override
    public int signup(Member inputMember) {
        // 비밀번호 암호화
        String encryptedPw = bcrypt.encode(inputMember.getMemberPw());
        inputMember.setMemberPw(encryptedPw);

        // 회원가입 처리
        return mapper.signup(inputMember);
    }

    @Override
    public int checkEmail(String memberEmail) {
        return mapper.checkEmail(memberEmail);
    }

    @Override
    public int checkNickname(String memberNickname) {
        return mapper.checkNickname(memberNickname);
    }

    @Override
    public Member kakaoLogin(String kakaoId) {
        // TODO: 카카오 로그인 처리
        return null;
    }
    
    

    private final JavaMailSender mailSender;

    public MemberServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** 인증번호 생성 */
    @Override
    public String createRandomCode() {
        int code = (int)(Math.random() * 900000) + 100000; // 100000 ~ 999999
        return String.valueOf(code);
    }

    /** 인증번호 이메일로 전송 */
    @Override
    public boolean sendAuthCodeToEmail(String email, String authCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[UBI] 회원가입 인증번호 안내");
            message.setText("인증번호: " + authCode + "\n입력창에 인증번호를 입력해주세요.");
            message.setFrom("noreply@ubi.com");

            mailSender.send(message);
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    // 아이디 중복 검사
    @Override
    public boolean checkIdAvailable(String memberId) {
        return mapper.checkMemberId(memberId) == 0;
    }

    // 닉네임 중복 검사
    @Override
    public boolean checkNicknameAvailable(String memberNickname) {
        return mapper.checkNickname(memberNickname) == 0;
    }
}

