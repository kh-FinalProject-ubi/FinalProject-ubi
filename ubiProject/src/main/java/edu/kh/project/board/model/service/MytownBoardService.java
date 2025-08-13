package edu.kh.project.board.model.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import edu.kh.project.board.model.dto.Board;

public interface MytownBoardService {

    /** 필터 조건에 맞는 게시글 총 개수 */
    int getFilteredBoardCount(Map<String, Object> paramMap);

    /** 필터 + 페이징 게시글 목록 */
    List<Board> getFilteredBoardList(Map<String, Object> paramMap);

    /** 게시글 상세 (memberNo는 로그인 안했으면 null) */
    Board selectLocalBoardDetail(int boardNo, Integer memberNo);

    /** 게시글 작성 (해시태그/이미지/시설·혜택 연동 포함) */
    int writeBoard(Board dto);

    /** 해시태그 단건 추가 */
    void insertHashtag(int boardNo, String tag);

    /** 에디터 이미지 업로드 (URL 반환) */
    String saveBoardImage(MultipartFile uploadFile) throws IOException;

    /** 좋아요 여부 확인 */
    int checkBoardLike(int boardNo, int memberNo);

    /** 좋아요 등록 */
    int insertBoardLike(int boardNo, int memberNo);

    /** 좋아요 취소 */
    int deleteBoardLike(int boardNo, int memberNo);

    /** 게시글 삭제(소프트 삭제) */
    int deleteBoard(int boardNo, int memberNo);

    /** 게시글 수정 (본문/해시태그/이미지 갱신) */
    int updateBoard(Board dto);

    /** 게시글 작성자 회원번호 조회 */
    int getBoardWriterNo(int boardNo);

    /** 게시글 신고/취소/재활성화 토글 */
    boolean reportBoard(int boardNo, int memberNo);

    /** 내가 신고했는지 상태 조회 (Y/N/null) */
    String checkBoardReportStatus(int boardNo, int memberNo);

    /** 특정 시설 후기 목록 */
    List<Board> getBoardListByFacilityServiceId(String facilityServiceId);

    /** 특정 복지혜택 후기 목록 */
    List<Board> getBoardListByWelfareServiceId(String apiServiceId);

    /** 인기 해시태그 TOP N(서버에서 5개로 제한 중) */
    List<String> getPopularTags();
}
