package edu.kh.project.board.model.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.BoardImage;
import edu.kh.project.board.model.mapper.CommentMapper;
import edu.kh.project.board.model.mapper.MytownBoardMapper;
import edu.kh.project.member.model.mapper.MemberMapper;

@Service
@RequiredArgsConstructor
public class MytownBoardServiceImpl implements MytownBoardService {

    @Value("${my.board.folder-path}")
    private String folderPath;

    @Value("${my.board.web-path}")
    private String webPath;

    private final MytownBoardMapper mapper;
    private final MemberMapper memberMapper;
    private final CommentMapper commentMapper;

    // ========================= 목록/상세 =========================

    @Override
    public int getFilteredBoardCount(Map<String, Object> paramMap) {
        return mapper.getFilteredBoardCount(paramMap);
    }

    @Override
    public List<Board> getFilteredBoardList(Map<String, Object> paramMap) {
        return mapper.getFilteredBoardList(paramMap);
    }

    @Override
    @Transactional(readOnly = true)
    public Board selectLocalBoardDetail(int boardNo, Integer memberNo) {
        Board board = mapper.selectLocalBoardDetail(boardNo, memberNo == null ? null : memberNo);
        // 조회수 증가를 상세 조회 트랜잭션과 분리하고 싶다면 별도 서비스로 빼세요.
        mapper.increaseReadCount(boardNo);

        if (board != null) {
            List<BoardImage> imageList = mapper.selectBoardImageList(boardNo);
            board.setImageList(imageList);
        }
        return board;
    }

    // ========================= 좋아요 =========================

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

    // ========================= 작성/업로드 =========================

    @Override
    @Transactional
    public int writeBoard(Board dto) {
        // 후기 유형별 연동 데이터(시설/혜택) 선등록
        ensureFacilityPresentIfNeeded(dto);
        ensureWelfarePresentIfNeeded(dto);

        // 게시글 등록
        mapper.insertBoard(dto);
        int boardNo = mapper.getLastInsertedId();

        // 해시태그 (중복 방지)
        if (dto.getHashtagList() != null) {
            dto.getHashtagList().stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .forEach(tag -> {
                        if (mapper.checkHashtagExists(boardNo, tag) == 0) {
                            mapper.insertHashtag(boardNo, tag);
                        }
                    });
        }

        // 이미지
        int order = 0;
        for (BoardImage img : dto.getImageList()) {
            img.setBoardNo(boardNo);
            img.setImageOrder(order++); // ✅ 무조건 서버가 순번 지정
            mapper.insertBoardImage(img);
        }


        return boardNo;
    }

    @Override
    public void insertHashtag(int boardNo, String tag) {
        if (tag == null) return;
        String t = tag.trim();
        if (t.isEmpty()) return;
        if (mapper.checkHashtagExists(boardNo, t) == 0) {
            mapper.insertHashtag(boardNo, t);
        }
    }

    @Override
    public String saveBoardImage(MultipartFile uploadFile) throws IOException {
        String safeFileName = UUID.randomUUID() + "_" + uploadFile.getOriginalFilename();
        File file = new File(folderPath, safeFileName);
        uploadFile.transferTo(file);

        String base = webPath.endsWith("/") ? webPath : webPath + "/";
        return (base + safeFileName).replaceAll("(?<!:)//+", "/");
    }

    // ========================= 삭제/수정 =========================

    @Override
    @Transactional
    public int deleteBoard(int boardNo, int memberNo) {
        return mapper.deleteBoard(boardNo, memberNo);
    }

    @Override
    @Transactional
    public int updateBoard(Board dto) {
        // 1) 본문/제목/별점/유형 수정
        int result = mapper.updateBoard(dto);
        if (result == 0) return 0;

        // 2) 해시태그 갱신 (전체 제거 후 삽입)
        mapper.deleteHashtags(dto.getBoardNo());
        if (dto.getHashtagList() != null) {
            dto.getHashtagList().stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .distinct()
                    .forEach(tag -> mapper.insertHashtag(dto.getBoardNo(), tag));
        }

        // 3) 이미지 갱신 정책
        List<BoardImage> newImages = dto.getImageList();
        if (newImages != null) {
            // 명시적으로 리스트가 왔다면 전체 교체
            mapper.deleteImagesByBoardNo(dto.getBoardNo());
            int order = 0;
            for (BoardImage img : newImages) {
                img.setBoardNo(dto.getBoardNo());
                img.setImageOrder(order++);
                mapper.insertBoardImage(img);
            }
        }
        // null 이면 이미지 변경 없음(기존 유지)

        return result;
    }

    // ========================= 조회 유틸 =========================

    @Override
    public int getBoardWriterNo(int boardNo) {
        return mapper.selectBoardWriterNo(boardNo);
    }

    // ========================= 신고/정지 =========================

    @Override
    @Transactional
    public boolean reportBoard(int boardNo, int memberNo) {
        Integer targetMemberNo = mapper.selectBoardWriterNo(boardNo);
        if (targetMemberNo == null) return false;

        String status = mapper.checkBoardReportCount(boardNo, memberNo); // null, "Y", "N"
        int before = mapper.selectBoardReportTotalCount(boardNo);

        if (status == null) {
            // 최초 신고
            Map<String, Object> param = new HashMap<>();
            param.put("boardNo", boardNo);
            param.put("memberNo", memberNo);
            param.put("targetMemberNo", targetMemberNo);
            mapper.insertBoardReport(param);
            mapper.updateBoardReportCount(boardNo);

            handleReportThresholdAfterChange(boardNo, targetMemberNo);
            return true;

        } else if ("Y".equals(status)) {
            // 신고 취소
            mapper.deleteBoardReport(boardNo, memberNo);
            mapper.decreaseBoardReportCount(boardNo);

            int after = mapper.selectBoardReportTotalCount(boardNo);
            // 3의 배수에서 2로 내려왔을 때 제재 회복 로직
            if (before % 3 == 0 && after % 3 == 2) {
                memberMapper.updateMemberReportCount(targetMemberNo, -1);
                maybeRecoverUserAndContents(targetMemberNo);
            }
            return false;

        } else { // "N" (재활성화)
            mapper.reactivateBoardReport(boardNo, memberNo);
            mapper.updateBoardReportCount(boardNo);

            handleReportThresholdAfterChange(boardNo, targetMemberNo);
            return true;
        }
    }

    @Override
    public String checkBoardReportStatus(int boardNo, int memberNo) {
        return mapper.selectReportStatus(boardNo, memberNo);
    }

    // ========================= 시설/혜택 후기 목록 =========================

    @Override
    public List<Board> getBoardListByFacilityServiceId(String facilityServiceId) {
        return mapper.selectBoardListByFacilityServiceId(facilityServiceId);
    }

    @Override
    public List<Board> getBoardListByWelfareServiceId(String apiServiceId) {
        return mapper.selectBoardListByWelfareServiceId(apiServiceId);
    }

    @Override
    public List<String> getPopularTags() {
        return mapper.selectPopularTags();
    }

    // ========================= 내부 헬퍼 =========================

    /** 후기 유형이 '복지시설후기'면, 시설 정보가 없을 때 한 번만 저장 */
    private void ensureFacilityPresentIfNeeded(Board dto) {
        if (!"복지시설후기".equals(dto.getPostType())) return;
        String facilityId = dto.getFacilityApiServiceId();
        if (facilityId == null) return;

        if (mapper.existsFacilityById(facilityId) == 0) {
            // 작성자 지역 정보 세팅
            dto.setRegionCity(memberMapper.selectMemberRegionCity(dto.getMemberNo()));
            dto.setRegionDistrict(memberMapper.selectMemberRegionDistrict(dto.getMemberNo()));
            mapper.insertFacilityFromBoard(dto);
        }
    }

    /** 후기 유형이 '복지혜택후기'면, 혜택 정보가 없을 때 한 번만 저장 */
    private void ensureWelfarePresentIfNeeded(Board dto) {
        if (!"복지혜택후기".equals(dto.getPostType())) return;
        String welfareId = dto.getApiServiceId();
        if (welfareId == null) return;

        if (mapper.existsWelfareById(welfareId) == 0) {
            mapper.insertWelfareFromBoard(dto);
        }
    }

    /** 신고 수 변경 이후 임계치 도달 시(3의 배수/5의 배수) 제재 처리 */
    private void handleReportThresholdAfterChange(int boardNo, int targetMemberNo) {
        int after = mapper.selectBoardReportTotalCount(boardNo);

        if (after % 3 == 0) {
            // 게시글 신고 3의 배수 → 유저 신고 카운트 +1
            memberMapper.updateMemberReportCount(targetMemberNo, +1);

            int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);
            Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

            if (memberReportCount % 5 == 0) {
                // 5의 배수마다 정지/연장
                LocalDateTime now = LocalDateTime.now();
                if (suspension == null) {
                    // 신규 정지 (예: 7일)
                    LocalDateTime end = now.plusDays(7);
                    memberMapper.insertSuspensionTest(targetMemberNo, now, end);
                } else {
                    // 기존 정지 연장 (예: +7일)
                    LocalDateTime originEnd = LocalDateTime.parse(suspension.get("END_DATE").replace(" ", "T"));
                    LocalDateTime end = originEnd.plusDays(7);
                    memberMapper.extendSuspensionEnd(targetMemberNo, end);
                }

                // 정지 시 컨텐츠 삭제
                commentMapper.selectAllReportComments(targetMemberNo).forEach(commentMapper::delete);
                mapper.selectAllReportBoards(targetMemberNo).forEach(bno -> {
                    Integer writerNo = mapper.selectBoardWriterNo(bno);
                    if (writerNo != null) mapper.deleteBoard(bno, writerNo);
                });
            }
        }
    }

    /** 신고 취소 등으로 제재 해제 필요 시 컨텐츠 복구 */
    private void maybeRecoverUserAndContents(int targetMemberNo) {
        int memberReportCount = memberMapper.selectMemberReportCount(targetMemberNo);
        Map<String, String> suspension = memberMapper.selectSuspension(targetMemberNo);

        if (memberReportCount < 5 && suspension != null) {
            // 정지 해제
            memberMapper.deleteSuspension(targetMemberNo);

            // 복구
            commentMapper.selectAllReportComments(targetMemberNo).forEach(commentMapper::recover);
            mapper.selectAllReportBoards(targetMemberNo).forEach(mapper::recoverBoard);
        }
    }
}
