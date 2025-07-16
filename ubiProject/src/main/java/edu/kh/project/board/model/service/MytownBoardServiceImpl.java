package edu.kh.project.board.model.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.ibatis.session.RowBounds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.board.model.mapper.CommentMapper;
import edu.kh.project.board.model.mapper.MytownBoardMapper;
import edu.kh.project.member.model.mapper.MemberMapper;

@Service
public class MytownBoardServiceImpl implements MytownBoardService {

	@Value("${my.board.folder-path}")
	private String folderPath;

	@Value("${my.board.web-path}")
	private String webPath;

	@Autowired
	private MytownBoardMapper mapper;

	// 멤버 테이블 매퍼
	@Autowired
	private MemberMapper memberMapper;

	@Autowired
	private CommentMapper commentMapper;
	
	/**
	 * 게시글 목록조회 시군구 조건 제외
	 * 
	 * @param regionDistrict
	 * @param regionCity
	 * @return
	 */
//	@Override
//	public int getBoardLocalListCount() {
//	    return mapper.getBoardLocalListCount();
//	}
//
//	@Override
//	public List<Board> getLocalBoardList(Pagination pagination) {
//	    int offset = (pagination.getCurrentPage() - 1) * pagination.getLimit();
//	    RowBounds rowBounds = new RowBounds(offset, pagination.getLimit());
//	    return mapper.selectLocalBoardList(rowBounds);
//	}
//
//	@Override
//	public int getFilteredBoardCount(Map<String, Object> paramMap) {
//	    return mapper.getFilteredBoardCount(paramMap);
//	}
//
//	@Override
//	public List<Board> getFilteredBoardList(Map<String, Object> paramMap) {
//	    int offset = (int) paramMap.getOrDefault("startRow", 0);
//	    int limit = (int) paramMap.getOrDefault("limit", 12);
//	    RowBounds rowBounds = new RowBounds(offset, limit);
//	    return mapper.getFilteredBoardList(paramMap, rowBounds);
//	}
	
	@Override
	public int getFilteredBoardCount(Map<String, Object> paramMap) {
	    return mapper.getFilteredBoardCount(paramMap);
	}

	@Override
	public List<Board> getFilteredBoardList(Map<String, Object> paramMap) {
	    return mapper.getFilteredBoardList(paramMap);
	}



	/**
	 * 상세조회
	 * 
	 */
	@Override
	public Board selectLocalBoardDetail(int boardNo, int memberNo) {
		Board board = mapper.selectLocalBoardDetail(boardNo, memberNo);

		int result = mapper.increaseReadCount(boardNo);

		if (board != null) {
			List<BoardImage> imageList = mapper.selectBoardImageList(boardNo);
			board.setImageList(imageList);
		}

		return board;
	}

	/**
	 * 
	 * @param dto
	 * @return
	 */
	@Override
	public int writeBoard(Board dto) {
		
	    // 1. 복지시설후기일 경우: 복지시설 테이블에 먼저 등록
        if ("복지시설후기".equals(dto.getPostType())) {
            String facilityId = dto.getFacilityApiServiceId();

            if (facilityId != null && mapper.existsFacilityById(facilityId) == 0) {
            	  // 지역정보도 dto에 담겨야 함
                dto.setRegionCity(memberMapper.selectMemberRegionCity(dto.getMemberNo()));
                dto.setRegionDistrict(memberMapper.selectMemberRegionDistrict(dto.getMemberNo()));
                mapper.insertFacilityFromBoard(dto);
            }
        }

        // 2. 복지혜택후기일 경우: 복지혜택 테이블에 먼저 등록
        if ("복지혜택후기".equals(dto.getPostType())) {
            String welfareId = dto.getApiServiceId();

            if (welfareId != null && mapper.existsWelfareById(welfareId) == 0) {
                mapper.insertWelfareFromBoard(dto);
            }
        }
		// 게시글 등록
		mapper.insertBoard(dto);
		
		

		int boardNo = mapper.getLastInsertedId();

		// 해시태그 중복 없이 삽입
		if (dto.getHashtagList() != null) {
			for (String tag : dto.getHashtagList()) {
				// 중복 체크 후 없을 경우에만 삽입
				int exists = mapper.checkHashtagExists(boardNo, tag);
				if (exists == 0) {
					mapper.insertHashtag(boardNo, tag);
				}
			}

		}

		// ✅ 이미지 리스트 저장
		List<BoardImage> imageList = dto.getImageList();
		if (imageList != null && !imageList.isEmpty()) {
			for (BoardImage img : imageList) {
				img.setBoardNo(boardNo);
				mapper.insertBoardImage(img);
			}
		}
		return boardNo;
		
		
		
	}

	/**
	 * 해시태그
	 * 
	 */
	@Override
	public void insertHashtag(int boardNo, String tag) {
		mapper.insertHashtag(boardNo, tag);
	}

	@Override
	public String saveBoardImage(MultipartFile uploadFile) throws IOException {
		String fileName = UUID.randomUUID().toString() + "_" + uploadFile.getOriginalFilename();
		File file = new File(folderPath + fileName);
		uploadFile.transferTo(file);
		return (webPath + "/" + fileName).replaceAll("/+", "/"); // 슬래시 2번 이상 → 1번
	}

	/**
	 * 게시글 좋아요
	 * 
	 */
	@Override
	public int checkBoardLike(int boardNo, int memberNo) {
		return mapper.checkBoardLike(boardNo, memberNo);
	}

	@Override
	public int insertBoardLike(int boardNo, int memberNo) {
		return mapper.insertBoardLike(boardNo, memberNo);
	}

	@Override
	public int deleteBoardLike(int boardNo, int memberNo) {
		return mapper.deleteBoardLike(boardNo, memberNo);
	}

	/**
	 * 삭제하기
	 */
	@Override
	public int deleteBoard(int boardNo, int memberNo) {
		return mapper.deleteBoard(boardNo, memberNo);
	}

	/**
	 * 수정 하기
	 * 
	 */
	@Override
	public int updateBoard(Board dto) {
	    // 1. 게시글 본문/제목/별점/유형 수정
	    int result = mapper.updateBoard(dto);
	    if (result == 0) return 0;

	    // 2. 해시태그 갱신
	    mapper.deleteHashtags(dto.getBoardNo());
	    if (dto.getHashtagList() != null) {
	        for (String tag : dto.getHashtagList()) {
	            mapper.insertHashtag(dto.getBoardNo(), tag.trim());
	        }
	    }

	    // 3. 이미지 처리
	    List<BoardImage> newImageList = dto.getImageList();

	    if (dto.getImageList() != null && !dto.getImageList().isEmpty()) {
	        // 새 이미지가 있을 경우에만 기존 삭제 및 재삽입
	        mapper.deleteImagesByBoardNo(dto.getBoardNo());

	        for (int i = 0; i < dto.getImageList().size(); i++) {
	            BoardImage img = dto.getImageList().get(i);
	            img.setBoardNo(dto.getBoardNo());
	            img.setImageOrder(i);
	            mapper.insertBoardImage(img);
	        }
	    } else {
	        // 이미지 수정이 없으면 기존 이미지 유지, 썸네일 보장
	        List<BoardImage> originList = mapper.selectBoardImageList(dto.getBoardNo());

	        if (!originList.isEmpty()) {
	            boolean hasThumbnail = originList.stream().anyMatch(img -> img.getImageOrder() == 0);

	            if (!hasThumbnail) {
	                for (int i = 0; i < originList.size(); i++) {
	                    BoardImage img = originList.get(i);
	                    img.setImageOrder(i);
	                    mapper.updateImageOrder(img);
	                }
	            }
	        }
	    }

	    return result;
	}
	
	/**
	 * 
	 */
	@Override
	public int getBoardWriterNo(int boardNo) {
	    return mapper.selectBoardWriterNo(boardNo);
	}
	

	@Override
	public boolean reportBoard(int boardNo, int memberNo) {

	    Integer targetMemberNo = mapper.selectBoardWriterNo(boardNo);
	    if (targetMemberNo == null)
	        return false;

	    String reportStatus = mapper.checkBoardReportCount(boardNo, memberNo);

	    int beforeReportCount = mapper.selectBoardReportTotalCount(boardNo);

	    try {
	        if (reportStatus == null) {
	            // 최초 신고
	            Map<String, Object> paramMap = new HashMap<>();
	            paramMap.put("boardNo", boardNo);
	            paramMap.put("memberNo", memberNo);
	            paramMap.put("targetMemberNo", targetMemberNo);
	            int result = mapper.insertBoardReport(paramMap);
	            System.out.println("insertBoardReport result: " + result);
	            mapper.updateBoardReportCount(boardNo);

	            int afterReportCount = mapper.selectBoardReportTotalCount(boardNo);

	            if (afterReportCount % 3 == 0) {
	                memberMapper.updateMemberReportCount(targetMemberNo, +1);

	                int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);

	                Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

	                if (memberReportCount % 5 == 0) {
	                    LocalDateTime now = LocalDateTime.now();
	                    if (suspension == null) {
	                        // 신규 정지 등록 (5의 배수일 때)
	                        LocalDateTime end = now.plusMinutes(5);
	                        memberMapper.insertSuspensionTest(targetMemberNo, now, end);
	                    } else {
	                        // 정지 중이면 정지 기간 연장
	                        LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
	                        LocalDateTime end = originEnd.plusMinutes(5); // 연장 기간 설정
	                        memberMapper.extendSuspensionEnd(targetMemberNo, end);
	                    }

	                    // ▶ 회원 정지 발생 시 신고당한 게시글 및 댓글 삭제 처리
	                    List<Integer> reportedComments = commentMapper.selectAllReportComments(targetMemberNo);
	                    for (int commentNo : reportedComments) {
	                        commentMapper.delete(commentNo);
	                    }

	                    List<Integer> reportedBoardNos = mapper.selectAllReportBoards(targetMemberNo);
	                    for (int bno : reportedBoardNos) {
	                        Integer boardWriterNo = mapper.selectBoardWriterNo(bno);
	                        if (boardWriterNo != null) {
	                            mapper.deleteBoard(bno, boardWriterNo);
	                        }
	                    }
	                }
	            }
	            return true;

	        } else if ("Y".equals(reportStatus)) {
	            // 신고 취소
	            mapper.deleteBoardReport(boardNo, memberNo);
	            mapper.decreaseBoardReportCount(boardNo);

	            int afterReportCount = mapper.selectBoardReportTotalCount(boardNo);

	            if (beforeReportCount % 3 == 0 && afterReportCount % 3 == 2) {
	                memberMapper.updateMemberReportCount(targetMemberNo, -1);

	                int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);

	                // 정지 상태 조회
	                Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

	                // 신고 카운트가 5 미만이고 정지 상태면 해제
	                if (memberReportCount < 5 && suspension != null) {
	                    memberMapper.deleteSuspension(targetMemberNo);

	                    // ▶ 신고 취소 및 정지 해제 시 댓글, 게시글 복구 (단, 정지 기록이 존재할 때만)
	                    List<Integer> reportedComments = commentMapper.selectAllReportComments(targetMemberNo);
	                    for (int commentNo : reportedComments) {
	                        commentMapper.recover(commentNo);
	                    }

	                    List<Integer> reportedBoards = mapper.selectAllReportBoards(targetMemberNo);
	                    for (int bno : reportedBoards) {
	                        mapper.recoverBoard(bno);
	                    }
	                }
	            }
	            return false;

	        } else if ("N".equals(reportStatus)) {
	            // 신고 재활성화
	            mapper.reactivateBoardReport(boardNo, memberNo);
	            mapper.updateBoardReportCount(boardNo);

	            int afterReportCount = mapper.selectBoardReportTotalCount(boardNo);

	            if (afterReportCount % 3 == 0) {
	                memberMapper.updateMemberReportCount(targetMemberNo, +1);

	                int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);
	                Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

	                if (memberReportCount % 5 == 0) {
	                    LocalDateTime now = LocalDateTime.now();

	                    if (suspension == null) {
	                        LocalDateTime end = now.plusMinutes(5);
	                        memberMapper.insertSuspensionTest(targetMemberNo, now, end);
	                    } else {
	                        LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
	                        LocalDateTime end = originEnd.plusMinutes(5);
	                        memberMapper.extendSuspensionEnd(targetMemberNo, end);
	                    }

	                    // ▶ 신고 누적으로 인한 정지 시 게시글 및 댓글 삭제 처리
	                    List<Integer> reportedComments = commentMapper.selectAllReportComments(targetMemberNo);
	                    for (int commentNo : reportedComments) {
	                        commentMapper.delete(commentNo);
	                    }

	                    List<Integer> reportedBoardNos = mapper.selectAllReportBoards(targetMemberNo);
	                    for (int bno : reportedBoardNos) {
	                        Integer boardWriterNo = mapper.selectBoardWriterNo(bno);
	                        if (boardWriterNo != null) {
	                            mapper.deleteBoard(bno, boardWriterNo);
	                        }
	                    }
	                }
	            }
	            return true;
	        }

	    } catch (Exception e) {
	        System.out.println("⛔ reportBoard 트랜잭션 처리 중 예외 발생!");
	        e.printStackTrace();
	        throw e;
	    }

	    return false;
	}

	// 신고 확인 메서드
	@Override
	public String checkBoardReportStatus(int boardNo, int memberNo) {
		 return mapper.selectReportStatus(boardNo, memberNo);
	}
	
	/**
	 * 
	 */
	  @Override
	    public List<Board> getBoardListByFacilityServiceId(String facilityServiceId) {
	        return mapper.selectBoardListByFacilityServiceId(facilityServiceId);
	    }
	  
	  @Override
	  public List<Board> getBoardListByWelfareServiceId(String apiServiceId) {
	      return mapper.selectBoardListByWelfareServiceId(apiServiceId);
	  }
	  
	  /**
	   * 
	   */
	  @Override
	  public List<String> getPopularTags() {
	      return mapper.selectPopularTags();
	  }
}
