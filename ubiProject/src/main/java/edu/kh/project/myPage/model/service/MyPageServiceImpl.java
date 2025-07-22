package edu.kh.project.myPage.model.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.board.model.dto.BoardLike;
import edu.kh.project.common.util.Utility;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.myPage.model.dto.UploadFile;
import edu.kh.project.myPage.model.mapper.MyPageMapper;
import edu.kh.project.welfare.benefits.model.dto.Facility;
import edu.kh.project.welfare.benefits.model.dto.FacilityJob;
import edu.kh.project.welfare.benefits.model.dto.Welfare;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(rollbackFor = Exception.class)
@PropertySource("classpath:/config.properties")
@Slf4j
public class MyPageServiceImpl implements MyPageService {

   @Autowired
   private MyPageMapper mapper;

   // Bcrypt 암호화 객체 의존성 주입(SecurityConfig 참고)
   @Autowired
   private BCryptPasswordEncoder bcrypt;

   @Value("${my.profile.web-path}")
   private String profileWebPath; // /myPage/profile/

   @Value("${my.profile.folder-path}")
   private String profileFolderPath; // home/ec2-useruploadFiles/profile/
   
   // 내 기본 정보 조회
   @Override
   public Member info(int memberNo) {
      return mapper.info(memberNo);
   }
   
   // 회원 정보 수정
   @Override
   public int updateInfo(Member member) {
      return mapper.updateInfo(member);
   }
   
   // 내가 찜한 혜택 조회
   @Override
   public List<Welfare> getWelfareBenefits(int memberNo) {
      return mapper.getWelfareBenefits(memberNo);
   }
   
   // 내가 찜한 채용 조회
   @Override
   public List<FacilityJob> getRecruitBenefits(int memberNo) {
      return mapper.getRecruitBenefits(memberNo);
   }
   
   // 내가 찜한 시설 조회
   @Override
   public List<Facility> getFacilityBenefits(int memberNo) {
      return mapper.getFacilityBenefits(memberNo);
   }
   
   
   // 작성글 조회
   @Override
   public List<Board> baord(int memberNo) {
      
      List<Board> board =  mapper.board(memberNo);
      
      List<Integer> boardNoList = board.stream()
               .map(Board::getBoardNo)
               .collect(Collectors.toList());

           // 3. 게시글 번호로 해시태그 전부 조회 (resultType="map")
           List<Map<String, Object>> hashtagRows = mapper.selectHashtagsByBoardNoList(boardNoList);

           // 4. 게시글 번호 → 해시태그 리스트로 변환
           Map<Integer, List<String>> tagMap = new HashMap<>();
           for (Map<String, Object> row : hashtagRows) {
               Integer boardNo = ((Number) row.get("BOARD_NO")).intValue();
               String tag = (String) row.get("HASHTAG_NAME");
               tagMap.computeIfAbsent(boardNo, k -> new ArrayList<>()).add(tag);
           }

           // 5. 게시글에 쉼표로 연결된 해시태그 문자열 세팅
           for (Board b : board) {
               List<String> tags = tagMap.getOrDefault(b.getBoardNo(), Collections.emptyList());
               b.setHashtags(String.join(",", tags));
           }

           return board;
       }
   
   // 작성 댓글 조회
   @Override
   public List<Comment> Comment(int memberNo) {
      return mapper.Comment(memberNo);
   }
   
   // 내가 좋아요를 누른 게시글 조회
   @Override
   public List<BoardLike> like (int memberNo) {
      
      return mapper.like(memberNo);
   }
   
   
   // 내가 좋아요를 누른 댓글 조회
   @Override
   public List<Comment> likeComment(int memberNo) {
      return mapper.likeComment(memberNo);
   }

   // 비밀번호 확인
   @Override
   public int selectPw(String currentPassword, int memberNo) {

      // 1. 현재 비밀번호가 일치하는지 확인하기
      // - 현재 로그인한 회원의 암호화된 비밀번호를 DB에서 조회
      String originPw = mapper.selectPw(memberNo);

      // 입력 받은 현재 비밀번호와(평문)
      // DB에서 조회한 비밀번호(암호화)를 비교
      // -> bcrypt.matches(평문, 암호화비번) 사용

      // 다를 경우 "asd123"
      if (!bcrypt.matches(currentPassword, originPw)) {
         return 0;
      }

      return 1;
   }
   
   // 비밀번호 변경
   @Override
   public int changePw(String newPw, int memberNo) {
      
      // 2. 같을 경우

      // 새 비밀번호를 암호화(bcrypt.encode(평문) > 암호화된 비밀번호 반환)
      String encPw = bcrypt.encode(newPw);

      // DB에 업데이트
      // SQL 전달 해야하는 데이터 2개 (암호화한 새 비번 encPw, 회원번호 memberNo)
      // -> mapper에 전달할 수 있는 전달인자는 단 1개..
      // -> 묶어서 전달 (paramMap 재활용)

      Map<String, String> paramMap = new HashMap<>();
            
      paramMap.put("memberNo", memberNo + ""); // 1 + "" => 문자열
      
      paramMap.put("encPw", encPw );

      return mapper.changePw(paramMap);
   }

   
   // 회원 탈퇴 서비스
   @Override
   public int withdraw(int memberNo) {

      return mapper.withdraw(memberNo);
   }

   // 파일 업로드 테스트 1
   @Override
   public String fileUpload1(MultipartFile uploadFile) throws Exception {

      // MultipartFile 이 제공하는 메소드
      // - getSize() : 파일 크기
      // - isEmpty() : 업로드한 파일이 없을 경우 true / 있다면 false
      // - getOriginFileName() : 원본 파일명
      // - transferTO(경로) :
      // 메모리 또는 임시 저장 경로에 업로드 된 파일을
      // 원하는 경로에 실제로 전송 (서버 어떤 경로 폴더에 저장할 지 지정)

      // 업로드한 파일이 없을 경우
      if (uploadFile.isEmpty()) {
         return null;
      }

      // 업로드한 파일이 있을 경우
      // home/ec2-useruploadFiles/test/파일명으로 서버에 저장
      uploadFile.transferTo(new File("/home/ec2-user/uploadFiles/test/" + uploadFile.getOriginalFilename()));

      // 웹에서 해당 파일에 접근할 수 있는 경로로 반환
      // 서버 : home/ec2-useruploadFiles/test/A.jpg
      // 웹 접근 주소 : /myPage/file/A.jpg

      return "/myPage/file/" + uploadFile.getOriginalFilename();
   }

   @Override
   public int fileUpload2(MultipartFile uploadFile, int memberNo) throws Exception {

       // 업로드된 파일이 없을 때
       if (uploadFile.isEmpty()) return 0;

       // ✅ 1. 절대 경로 사용 + 디렉토리 구분자 통일
       String folderPath = "/home/ec2-user/uploadFiles/test/";
       String webPath = "/myPage/file/";

       // ✅ 2. 디렉토리 없으면 생성
       File dir = new File(folderPath);
       if (!dir.exists()) {
           boolean made = dir.mkdirs();
           log.info("📂 파일 저장 디렉토리 생성됨? : " + made);
       }

       // ✅ 3. 파일명에서 경로 제거
       String originalFilename = Paths.get(uploadFile.getOriginalFilename()).getFileName().toString();

       // ✅ 4. 저장용 이름 생성
       String fileRename = Utility.fileRename(originalFilename);

       // ✅ 5. DB에 저장할 파일 정보 구성
       UploadFile uf = UploadFile.builder()
           .memberNO(memberNo)
           .filePath(webPath)
           .fileOriginalName(originalFilename)
           .fileRename(fileRename)
           .build();

       // ✅ 6. DB INSERT
       int result = mapper.insertUploadFile(uf);
       if (result == 0) return 0;

       // ✅ 7. 서버에 실제 파일 저장
       File targetFile = new File(folderPath + fileRename);
       uploadFile.transferTo(targetFile);

       log.info("✅ 파일 저장 완료: " + targetFile.getAbsolutePath());

       return result;
   }

   @Override
   public List<UploadFile> fileList(int memberNo) {
      return mapper.fileList(memberNo);
   }

   // 여러 파일 업로드 서비스
   @Override
   public int fileUpload3(List<MultipartFile> aaaList, List<MultipartFile> bbbList, int memberNo) throws Exception {

      // 1. aaaList 처리
      int result1 = 0; // 결과(INSERT된 행의 갯수)를 저장할 변수

      // 업로드된 파일이 없을 경우를 제외하고 업로드
      for (MultipartFile file : aaaList) {

         if (file.isEmpty()) { // 파일이 없으면 다음 파일
            continue;

         }

         // DB에 저장 + 서버 실제로 저장
         // fileUpload2() 메서드를 호출(재활용)
         result1 += fileUpload2(file, memberNo);

      }

      // 2. bbbList 처리
      int result2 = 0; // 결과(INSERT된 행의 갯수)를 저장할 변수

      // 업로드된 파일이 없을 경우를 제외하고 업로드
      for (MultipartFile file : bbbList) {

         if (file.isEmpty()) { // 파일이 없으면 다음 파일
            continue;

         }

         // DB에 저장 + 서버 실제로 저장
         // fileUpload2() 메서드를 호출(재활용)
         result2 += fileUpload2(file, memberNo);

      }

      return result1 + result2;
   }

   @Override
   public String profile(int memberNo, MultipartFile profileImg) {

       log.info("📥 [프로필 업로드 요청] 회원번호: " + memberNo);
       if (profileImg == null || profileImg.isEmpty()) {
           log.warn("⚠️ 업로드된 파일이 없습니다.");
           return null;
       }

       String updatePath = null;
       String rename = null;

       try {
           // 저장 경로 확보
           String folderPath = profileFolderPath;
           if (!folderPath.endsWith(File.separator)) {
               folderPath += File.separator;
           }

           File dir = new File(folderPath);
           if (!dir.exists()) {
               boolean made = dir.mkdirs();
               log.info("📂 디렉토리 생성됨? : " + made);
           }

           // 파일명 리네임 및 저장
           rename = Utility.fileRename(profileImg.getOriginalFilename());
           File targetFile = new File(folderPath + rename);

           profileImg.transferTo(targetFile);
           log.info("✅ 프로필 이미지 저장 완료: " + targetFile.getAbsolutePath());

           // 웹 경로 구성
           updatePath = profileWebPath + rename;

           // DB 업데이트
           Member member = Member.builder()
                   .memberNo(memberNo)
                   .memberImg(updatePath)
                   .build();

           int result = mapper.profile(member);
           if (result > 0) {
               return updatePath;
           } else {
               log.error("❌ DB 업데이트 실패");
               return null;
           }

       } catch (IOException | IllegalStateException e) {
           log.error("❌ 프로필 이미지 저장 중 예외 발생", e);
           return null;
       } catch (Exception ex) {
           log.error("❌ 알 수 없는 예외 발생", ex);
           return null;
       }
   }
   // 프로필 이미지 초기화
   @Override
   public int deleteProfile(int memberNo) {
      return mapper.deleteProfile(memberNo);
   }
   
   // 찜 취소
   @Override
   public int cancelZzim(Map<String, Object> map) {
      return mapper.cancelZzim(map);
   }
   
   @Override
   public Member selectMemberByNo(int memberNo) {
       return mapper.selectMemberByNo(memberNo); // MyBatis 매퍼 호출
   }
   
   @Override
	public int cancelFacilityZzim(Map<String, Object> map) {
		return mapper.cancelFacilityZzim(map);
	}
   
}
