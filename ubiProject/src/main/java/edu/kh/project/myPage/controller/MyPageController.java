package edu.kh.project.myPage.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Comment;
import edu.kh.project.common.util.JwtUtil;
import edu.kh.project.board.model.dto.BoardLike;
import edu.kh.project.member.model.dto.Member;
import edu.kh.project.myPage.model.dto.UploadFile;
import edu.kh.project.myPage.model.service.MyPageService;
import edu.kh.project.welfare.benefits.model.dto.Facility;
import edu.kh.project.welfare.benefits.model.dto.FacilityJob;
import edu.kh.project.welfare.benefits.model.dto.Welfare;
import lombok.extern.slf4j.Slf4j;

/*
 * @SessionAttributes 의 역할
 * - Model에 추가된 속성 중 key값이 일치하는 속성을 session scope로 변경
 * - SessionStatus 이용 시 session에 등록된 완료할 대상을 찾는 용도
 * 
 * @SessionAttribute 의 역할 (매개변수에 쓰는 것)
 * - Session에 존재하는 값을 key로 얻어오는 역할
 * */

@RestController
@CrossOrigin(origins="http://localhost:5173"/*, allowCredentials = "true"*/)
//allowCredentials = "true" 클라이언트로부터 들어오는 쿠키 허용
//@SessionAttributes({ "loginMember" })
@RequestMapping("api/myPage")
@Slf4j
public class MyPageController {

	@Autowired
	private MyPageService service;
	
	@Autowired
	private JwtUtil jwtU;

	
	// 내 기본 정보 조회
	@GetMapping("info")
    public ResponseEntity<Object> info(@RequestHeader("Authorization") String authorizationHeader) {
        try {
        	
        	if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
	        }
		  
		  String token = authorizationHeader.substring(7);
			
		  if (!jwtU.validateToken(token)) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
	        }

	        // 3️⃣ 토큰에서 회원 번호 추출
	        Long memberNoLong = jwtU.extractMemberNo(token);
	        int memberNo = memberNoLong.intValue();
        	
        	
            if (memberNo == 0) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
            }
            
            Member member = service.info(memberNo);
            return ResponseEntity.status(HttpStatus.OK).body(member);
            
        } catch (Exception e) {
            log.error("내 정보 조회 중 에러 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
	
	 /** 회원 정보 수정
	 * 
	 * @param inputMember   : (@ModelAttribute가 생략된 상태) 제출된 수정된 회원 닉네임, 전화번호, 주소
	 * @param loginMember   : 로그인한 회원 정보 (회원 번호 사용할 예정)
	 * @param memberAddress 
	 * @return
	 */
	@PostMapping("update")
	public ResponseEntity<Object> updateInfo(@RequestBody Member member,
	                                         @RequestHeader("Authorization") String authorizationHeader) {
	    try {
	        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
	        }

	        String token = authorizationHeader.substring(7);

	        if (!jwtU.validateToken(token)) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
	        }

	        Long memberNoLong = jwtU.extractMemberNo(token);
	        int memberNo = memberNoLong.intValue();
	        member.setMemberNo(memberNo);

	        if (memberNo == 0) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
	        }

	        int result = service.updateInfo(member);

	        if (result > 0) {
	            // ✅ 수정된 회원 정보 다시 조회 (권한 포함)
	            Member updatedMember = service.selectMemberByNo(memberNo);

	            // ✅ 새로운 토큰 발급
	            String newToken = jwtU.generateToken(updatedMember);

	            return ResponseEntity.ok(Map.of(
	                "message", "회원 정보 수정을 완료했습니다!",
	                "token", newToken
	            ));
	        } else {
	            return ResponseEntity.badRequest().body("회원 정보 수정을 실패했습니다");
	        }

	    } catch (Exception e) {
	        log.error("내 정보 수정 중 에러 발생", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
	    }
	}

	
	// 내가 찜한 혜택 조회
	@GetMapping("service")
    public ResponseEntity<Object> service(@RequestParam("memberNo") int memberNo,
    									  @RequestParam("category") String category) {
        try {
            if (memberNo == 0) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
            }
            

            switch (category) {
                case "시설":
                	List<Facility> facitiy = service.getFacilityBenefits(memberNo);
                	 return ResponseEntity.status(HttpStatus.OK).body(facitiy);
                case "채용":
                	List<FacilityJob> facitiyJob = service.getRecruitBenefits(memberNo);
                	 return ResponseEntity.status(HttpStatus.OK).body(facitiyJob);
                case "혜택":
                	List<Welfare> walfare = service.getWelfareBenefits(memberNo);
                	 return ResponseEntity.status(HttpStatus.OK).body(walfare);
                default:
                	return ResponseEntity.badRequest().body("유효하지 않은 카테고리입니다.");
                    
            }
           
            
        } catch (Exception e) {
            log.error("내 혜택 조회 중 에러 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
	
	// 작성글 조회
	@GetMapping("board")
	public ResponseEntity<Object> board(@RequestParam("memberNo") int memberNo,
										@RequestParam("contentType") String contentType) {
		try {
			if (memberNo == 0) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
			}
			
			switch (contentType) {
			
			case "게시글" :
				List<Board> board = service.baord(memberNo);
				return ResponseEntity.status(HttpStatus.OK).body(board);
				
			case "댓글" :
				List<Comment> comment = service.Comment(memberNo);
				return ResponseEntity.status(HttpStatus.OK).body(comment);
				
			default:
            	return ResponseEntity.badRequest().body("유효하지 않은 카테고리입니다.");	
            	
			}
			
		} catch (Exception e) {
			log.error("내 정보 조회 중 에러 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	// 내가 좋아요를 누른 게시글 조회
	@GetMapping("like")
	public ResponseEntity<Object> like(@RequestParam("memberNo") int memberNo,
									   @RequestParam("contentType") String contentType) {
		try {
			
			if (memberNo == 0) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
			}
			
			switch (contentType) {
			
			case "게시글" :
				List<BoardLike> like = service.like(memberNo);
				return ResponseEntity.status(HttpStatus.OK).body(like);
				
			case "댓글" :
				List<Comment> likeComment = service.likeComment(memberNo);
				return ResponseEntity.status(HttpStatus.OK).body(likeComment);
				
			default:
            	return ResponseEntity.badRequest().body("유효하지 않은 카테고리입니다.");	
            	
			}
			
		} catch (Exception e) {
			log.error("내 정보 조회 중 에러 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	/**
	 * 비밀번호 확인
	 * 
	 * @param paramMap    : 모든 파라미터(요청 데이터)를 맵으로 저장
	 * @param loginMember : 세션에 등록된 현재 로그인한 회원 정보
	 * @param ra
	 * @return
	 */
	@PostMapping("selectPw") // /myPage/changePw POST 요청 매핑
	public ResponseEntity<Object> selectPw(@RequestBody Member request) {
		
		int memberNo = request.getMemberNo();
		String currentPassword = request.getMemberPw();
		
		try {
			if (memberNo == 0) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
			}
			
			// paramMap = {currentPw=asd123, newPw=pass02!, newPwConfirm=pass02!}
	
			// 현재 + 새 비번 + 새 비번 확인 (paramMap) + 회원번호(memberNo)를 서비스로 전달
			int result = service.selectPw(currentPassword, memberNo);

			return ResponseEntity.status(HttpStatus.OK).body(result);

		} catch (Exception e) {
				log.error("비밀번호 확인 중 오류 발생", e);
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			}

	}
	
	/** 비밀번호 변경
	 * @param memberNo
	 * @param currentPassword
	 * @return
	 */
	@PostMapping("changePw")
	public ResponseEntity<Object> changePw(@RequestBody Member request) {
		
		int memberNo = request.getMemberNo();
		String newPw = request.getMemberPw(); 
		
		try {
		if (memberNo == 0) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
		}
		
		
		// 현재 + 새 비번 + 새 비번 확인 (paramMap) + 회원번호(memberNo)를 서비스로 전달
		int result = service.changePw(newPw, memberNo);
		
		if(result > 0) {
			return ResponseEntity.status(HttpStatus.OK).body("비밀번호가 변경되었습니다!");
		} else {
			return ResponseEntity.badRequest().body("비밀번호가 변경에 실패했습니다!");	
		}
		
		
		} catch (Exception e) {
			log.error("비밀번호 변경 중 오류 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		
		}
	
	/**
	 * 회원탈퇴
	 * 
	 * @param paramMap    : 모든 파라미터(요청 데이터)를 맵으로 저장
	 * @param loginMember : 세션에 등록된 현재 로그인한 회원 정보
	 * @param ra
	 * @return
	 */
	@PostMapping("withdraw") // /myPage/changePw POST 요청 매핑
	public ResponseEntity<Object> withdraw(@RequestBody Member request) {
		
		int memberNo = request.getMemberNo();
		
		try {
			if (memberNo == 0) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
			}
			
	
//			 현재 + 새 비번 + 새 비번 확인 (paramMap) + 회원번호(memberNo)를 서비스로 전달
			int result = service.withdraw(memberNo);

			return ResponseEntity.status(HttpStatus.OK).body(result);

		} catch (Exception e) {
				log.error("비밀번호 확인 중 오류 발생", e);
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			}

	}

	/** 프로필 이미지 변경
	 * @param profileImage
	 * @param memberNo
	 * @return
	 */
	@PostMapping("profile")
	public ResponseEntity<Object> profile(@RequestParam("profileImage") MultipartFile profileImage,
										  @RequestHeader("Authorization") String authorizationHeader) {

		try {
			
			if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
		    }

		    String token = authorizationHeader.substring(7);

		    if (!jwtU.validateToken(token)) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
		    }

		    Long memberNoLong = jwtU.extractMemberNo(token);
		    int memberNo = memberNoLong.intValue();

		    String result = service.profile(memberNo, profileImage);

		    if (result != null) {
		        return ResponseEntity.ok(result); // 🔹 새 경로 반환
		    } else {
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("프로필 이미지 변경 실패");
		    }
			
		} catch (Exception e) {
			
			log.error("프로필 이미지 변경 중 에러 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}

		
	}
	
	/** 프로필 이미지 삭제
	 * @param profileImage
	 * @param memberNo
	 * @return
	 * @throws Exception
	 */
	@DeleteMapping("profile")
	public ResponseEntity<Object> profile(@RequestHeader("Authorization") String authorizationHeader ){
		
		try {
			
			if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
			}
			
			String token = authorizationHeader.substring(7);
			
			if (!jwtU.validateToken(token)) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
			}
			
			Long memberNoLong = jwtU.extractMemberNo(token);
			int memberNo = memberNoLong.intValue();
			
			int result = service.deleteProfile(memberNo);
			
			if (result > 0) {
				return ResponseEntity.ok(result);
			} else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("프로필 이미지 초기화 실패");
			}
			
		} catch (Exception e) {
			
			log.error("프로필 이미지 초기화 중 에러 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		
		
	}
	
	/** 찜 삭제
	 * @param profileImage
	 * @param memberNo
	 * @return
	 * @throws Exception
	 */
	@DeleteMapping("favorite")
	@ResponseBody
	public ResponseEntity<Object> cancelZzim(@RequestHeader("Authorization") String authorizationHeader,
											 @RequestParam ("serviceNo") int serviceNo){
		
		try {
			
			if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
			}
			
			String token = authorizationHeader.substring(7);
			
			if (!jwtU.validateToken(token)) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
			}
			
			Long memberNoLong = jwtU.extractMemberNo(token);
			int memberNo = memberNoLong.intValue();
			
			Map<String, Object> map = new HashMap<>();
			
			map.put("memberNo", memberNo);
			map.put("serviceNo", serviceNo);
			
			int result = service.cancelZzim(map);
			
			if (result > 0) {
				return ResponseEntity.ok(result);
			} else {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("프로필 이미지 초기화 실패");
			}
			
		} catch (Exception e) {
			
			log.error("프로필 이미지 초기화 중 에러 발생", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
		
		
	}
	
	@DeleteMapping("favorite/facility")
	@ResponseBody
	public ResponseEntity<Object> cancelZzimFacility(
	    @RequestHeader("Authorization") String authorizationHeader,
	    @RequestParam("facilityNo") String facilityNo
	) {
	    try {
	        // 1. 인증 헤더 확인
	        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 없습니다.");
	        }

	        // 2. JWT 토큰 파싱 및 유효성 검사
	        String token = authorizationHeader.substring(7);
	        if (!jwtU.validateToken(token)) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("토큰이 유효하지 않습니다.");
	        }

	        // 3. memberNo 추출
	        Long memberNoLong = jwtU.extractMemberNo(token);
	        int memberNo = memberNoLong.intValue();

	        // 4. 서비스로 Map 전달
	        Map<String, Object> map = new HashMap<>();
	        map.put("memberNo", memberNo);
	        map.put("facilityNo", facilityNo);

	        // 5. 실제 찜 해제 로직 호출
	        int result = service.cancelFacilityZzim(map);

	        if (result > 0) {
	            return ResponseEntity.ok(result);
	        } else {
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("시설 찜 해제 실패");
	        }
	    } catch (Exception e) {
	        log.error("시설 찜 해제 중 에러 발생", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	    }
	}
	
	

	
	// ---------------------------------------------------------------------------------------------------------------------

	/*
	 * Spring에서 파일 업로드를 처리하는 방법
	 * 
	 * - encType = "multipart/form-data"로 클라이언트 요청을 받으면 (문자, 숫자, 파일 등이 섞여있는 요청)
	 * 
	 * 이를 MultipartResolver(FileConfig에 정의)를 이용해서 섞여있는 파라미터를 분리
	 * 
	 * 문자열, 숫자 -> String 파일 -> MultipartFile
	 */
	@PostMapping("file/test1") // /myPage/file/test1 POST 요청 매핑
	public String fileUpload1(@RequestParam("uploadFile") MultipartFile uploadFile, RedirectAttributes ra)
			throws Exception {

		String path = service.fileUpload1(uploadFile);
		// 웹에서 접근할 수 있는 경로를 반환
		// path = /myPage/file/A.jpg

		// 파일이 저장되어 웹에서 접근할 수 있는 경로가 반환되었을 때
		if (path != null) {
			ra.addFlashAttribute("path", path);
		}
		return "redirect:/myPage/fileTest";
	}

	/**
	 * 업로드한 파일 DB 저장 + 서버 저장 + 조회
	 * 
	 * @param uploadFile
	 * @param loginMember
	 * @param ra
	 * @return
	 * @throws Exception
	 */
	@PostMapping("file/test2")
	public String fileUpload2(@RequestParam("uploadFile") MultipartFile uploadFile,
			@SessionAttribute("loginMember") Member loginMember, RedirectAttributes ra) throws Exception {

		// 로그인한 회원의 번호 얻어오기 (누가 업로드 했는가)
		int memberNo = loginMember.getMemberNo();

		// 업로드된 파일 정보를 DB에 INSERT 후 결과 행의 개수 반환받기
		int result = service.fileUpload2(uploadFile, memberNo);

		String message = null;

		if (result > 0) {
			message = "파일 업로드 성공";

		} else {
			message = "파일 업로드 실패";
		}

		ra.addFlashAttribute("message", message);

		return "redirect:/myPage/fileTest";

	}

	/**
	 * 파일 목록 조회 화면 이동
	 * 
	 * @param model
	 * @param loginMember : 현재 로그인한 회원의 번호가 필요
	 * @return
	 */
	@GetMapping("fileList")
	public String fileList(Model model, @SessionAttribute("loginMember") Member loginMember) {

		// 파일 목록 조회 서비스 호출 (현재 로그인한 회원이 올린 이미지만 조회)
		int memberNo = loginMember.getMemberNo();
		List<UploadFile> list = service.fileList(memberNo);

		// model에 list 담아서 forward
		model.addAttribute("list", list);

		return "myPage/myPage-fileList";
	}

	@PostMapping("file/test3") // /myPage/file/test3
	public String fileUpload3(@RequestParam("aaa") List<MultipartFile> aaaList,
			@RequestParam("bbb") List<MultipartFile> bbbList, @SessionAttribute("loginMember") Member loginMember,
			RedirectAttributes ra) throws Exception {

		log.debug("aaaList:" + aaaList);
		log.debug("bbbList: " + bbbList);

		// aaa 파일 미제출 시
		// -> 0번, 1번 인덱스가 존재하는 List가 있음
		// -> 0, 1번 인덱스에는 MultipartFile 객체가 존재하나, 둘다 비어있는 객체인 상태
		// -> 0, 1번 인덱스가 존재하는 이유는 html에서 제출된 파라미터 중 name 값이 aaa인 2개

		// bbb 파일 미제출 시
		// -> 0번 인덱스에 있는 MultipartFile 객체가 비어있음

		// 여러 파일 업로드 서비스 호출
		int memberNo = loginMember.getMemberNo();

		int result = service.fileUpload3(aaaList, bbbList, memberNo);
		// result == 업로드 된 파일 개수

		String message = null;

		if (result == 0) {
			message = "업로드된 파일이 없습니다.";

		} else {
			message =  result + "개의 파일이 업로드 되었습니다";

		}

		ra.addFlashAttribute("message", message);
		
		return "redirect:/myPage/fileTest";
	}
	
	
}


