package edu.kh.project.board.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.kh.project.board.model.dto.Board;
import edu.kh.project.board.model.dto.Pagination;
import edu.kh.project.board.model.service.MytownBoardService;
import edu.kh.project.common.util.JwtUtil;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class MytownBoardController {

    private final MytownBoardService service;
    private final JwtUtil jwtUtil;

    /** 게시글 목록 (필터 + 페이지네이션) */
    @GetMapping("/mytownBoard")
    public ResponseEntity<?> getBoards(
            @RequestParam(name = "page") int page,
            @RequestParam(name = "postType", required = false) String postType,
            @RequestParam(name = "regionCity", required = false) String regionCity,
            @RequestParam(name = "regionDistrict", required = false) String regionDistrict,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "tags", required = false) String tags
    ) {
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("postType", postType);
        paramMap.put("regionCity", regionCity);
        paramMap.put("regionDistrict", regionDistrict);
        paramMap.put("keyword", keyword);

        // tags → List<String>
        List<String> tagList = parseTags(tags);
        paramMap.put("tagList", tagList.isEmpty() ? null : tagList);

        // 총 개수 및 페이지네이션
        int listCount = service.getFilteredBoardCount(paramMap);
        Pagination pagination = new Pagination(page, listCount);
        paramMap.put("startRow", (pagination.getCurrentPage() - 1) * pagination.getLimit());
        paramMap.put("limit", pagination.getLimit());

        // 목록 조회
        List<Board> boardList = service.getFilteredBoardList(paramMap);

        return ResponseEntity.ok(Map.of(
                "boardList", boardList,
                "pagination", pagination
        ));
    }

    /** 게시글 상세 */
    @GetMapping("/mytownBoard/{boardNo}")
    public ResponseEntity<Board> getLocalBoardDetail(
            @PathVariable("boardNo") int boardNo,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Integer memberNo = extractMemberNo(authHeader);

        Board board = service.selectLocalBoardDetail(boardNo, memberNo);
        if (board == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // 로그인 사용자라면 좋아요/신고 상태 세팅
        if (memberNo != null) {
            board.setLikeCheck(service.checkBoardLike(boardNo, memberNo));
            board.setReportedByMe(service.checkBoardReportStatus(boardNo, memberNo));
        } else {
            board.setLikeCheck(0);
        }

        return ResponseEntity.ok(board);
    }

    /** 좋아요 토글 */
    @PostMapping("/mytownBoard/{boardNo}/like")
    public ResponseEntity<?> toggleBoardLike(
            @PathVariable("boardNo") int boardNo,
            @RequestParam("memberNo") int memberNo,
            @RequestParam("writerNo") int writerNo
    ) {
        if (memberNo == writerNo) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("본인의 글에는 좋아요를 누를 수 없습니다.");
        }

        boolean alreadyLiked = service.checkBoardLike(boardNo, memberNo) > 0;
        if (alreadyLiked) {
            service.deleteBoardLike(boardNo, memberNo);
            return ResponseEntity.ok("unliked");
        } else {
            service.insertBoardLike(boardNo, memberNo);
            return ResponseEntity.ok("liked");
        }
    }

    /** 게시글 신고 */
    @PostMapping("/mytownBoard/{boardNo}/report")
    public ResponseEntity<Map<String, Object>> reportBoard(
            @PathVariable("boardNo") int boardNo,
            @RequestHeader("Authorization") String authHeader
    ) {
        Map<String, Object> result = new HashMap<>();
        Integer memberNo = extractMemberNo(authHeader);

        if (memberNo == null) {
            result.put("error", "로그인 정보가 유효하지 않습니다.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }

        try {
            boolean reported = service.reportBoard(boardNo, memberNo);
            result.put("reported", reported);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", "신고 처리 중 오류 발생");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    /** 특정 시설 후기 목록 */
    @GetMapping("/mytownBoard/facility/{facilityServiceId}")
    public ResponseEntity<List<Board>> getPostsByFacility(@PathVariable("facilityServiceId") String facilityServiceId) {
        return ResponseEntity.ok(service.getBoardListByFacilityServiceId(facilityServiceId));
    }

    /** 특정 복지혜택 후기 목록 */
    @GetMapping("/mytownBoard/welfare/{apiServiceId}")
    public ResponseEntity<List<Board>> getPostsByWelfare(@PathVariable("apiServiceId") String apiServiceId) {
        return ResponseEntity.ok(service.getBoardListByWelfareServiceId(apiServiceId));
    }

    /** 인기 해시태그 */
    @GetMapping("/popular-tags")
    public ResponseEntity<List<String>> getPopularTags() {
        return ResponseEntity.ok(service.getPopularTags());
    }

    // =======================
    // 유틸 메서드
    // =======================

    /** Authorization 헤더에서 memberNo 추출 (없거나 파싱 실패 시 null) */
    private Integer extractMemberNo(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            String token = authHeader.substring(7);
            Long memberNo = jwtUtil.extractMemberNo(token);
            return memberNo != null ? memberNo.intValue() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /** "tag1, tag2, ..." → ["tag1","tag2"] */
    private List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) return List.of();
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }
}
