import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { generateTagList } from "../../utils/tagUtils";
import useAuthStore from "../../stores/useAuthStore";
import cityDistrictMap from "../../constants/cityDistrictMap";
import styles from "../../styles/board/MyTownBoardList.module.css";

function MyTownBoard() {
  const navigate = useNavigate();
  const { memberNo } = useAuthStore();

  // 원본 상태 변수 유지
  const [boardList, setBoardList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [postTypeCheck, setPostTypeCheck] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]); // 새 디자인을 위한 해시태그 상태 추가

  // 인기 해시태그 목록 (예시 데이터)
  const popularTags = ["만족후기", "비추천", "우리 동네", "질문", "자랑"];

  // HTML 태그 제거 유틸리티 (원본 유지)
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

 //  데이터 로딩
useEffect(() => {
  fetch(`/api/board/mytownBoard?page=${currentPage}`)
    .then((res) => res.json())
    .then((data) => {
      setBoardList(data.boardList);
      setPagination(data.pagination);
    })
    .catch((err) => console.error("Error:", err));
}, [currentPage]);

const displayedBoards = boardList; // 서버에서 전달된 현재 페이지 게시글
  // 해시태그 클릭 핸들러 (새 기능)
  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
    setCurrentPage(1);
  };

const postTypeMap = {
  "자유": "자유",
  "우리 동네 자랑": "자랑",
  "복지 혜택 후기": "복지혜택후기",
  "복지 시설 후기": "복지시설후기",
};

const matchRegion =
  !selectedCity ||
  (board.regionCity.includes(selectedCity) && (
    !selectedDistrict || board.regionDistrict === selectedDistrict
  ));
  
  // 필터링 로직 (해시태그 필터 추가)
 const filteredBoards = boardList.filter((board) => {
  const matchPostType =
    !postTypeCheck || board.postType === postTypeMap[postTypeCheck];

  const matchRegion =
    !selectedCity ||
    (board.regionCity.includes(selectedCity) &&
      (!selectedDistrict || board.regionDistrict === selectedDistrict));

  const keyword = searchKeyword.trim().toLowerCase();
  const matchSearch =
    !keyword ||
    board.boardTitle?.toLowerCase().includes(keyword) ||
    board.boardContent?.toLowerCase().includes(keyword);

  const boardTags = generateTagList(board).map((t) => t.toLowerCase());
  const matchTags =
    selectedTags.length === 0 ||
    selectedTags.every((tag) => boardTags.includes(tag.toLowerCase()));

  return matchPostType && matchRegion && matchSearch && matchTags;
});

console.log("원본 게시글 수:", boardList.length);
console.log("필터링 후 게시글 수:", filteredBoards.length);
  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>우리 동네 좋아요</h2>

      {/* --- 상단 검색바 (새 디자인 적용) --- */}
      <div className={styles.topSearchContainer}>
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button className={styles.sortButton}>정렬</button>
      </div>

      {/* --- 검색 필터 (새 디자인 적용) --- */}
      <div className={styles.filterContainer}>
        <h3 className={styles.filterTitle}>검색 필터</h3>
        <div className={styles.filterBox}>
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>게시판 유형</div>
            <div className={styles.filterContent}>
              {[
                "자유",
                "우리 동네 자랑",
                "복지 혜택 후기",
                "복지 시설 후기",
              ].map((type) => (
                <label key={type} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="postTypeCheck"
                    value={type}
                    checked={postTypeCheck === type}
                    onChange={(e) => {
                      setPostTypeCheck(e.target.value);
                      setCurrentPage(1);
                    }}
                    onClick={() => {
                      if (postTypeCheck === type) setPostTypeCheck("");
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>작성지역</div>
            <div className={styles.filterContent}>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict("");
                  setCurrentPage(1);
                }}
              >
                <option value="">시/도 선택</option>
                {Object.keys(cityDistrictMap).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!selectedCity}
              >
                <option value="">시/군/구 선택</option>
                {selectedCity &&
                  cityDistrictMap[selectedCity].map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>해시태그</div>
            <div className={styles.filterContent}>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`${styles.tagButton} ${
                    selectedTags.includes(tag) ? styles.tagSelected : ""
                  }`}
                >
                  # {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- 글쓰기 버튼 (원본 유지) --- */}
      <div className={styles.writeButtonContainer}>
        {memberNo && (
          <button
            onClick={() => navigate("/mytownBoard/write")}
            className={styles.writeButton}
          >
            글쓰기
          </button>
        )}
      </div>

      {/* --- 게시글 그리드 (새 디자인 적용) --- */}
      {displayedBoards.length > 0 ? (
        <div className={styles.boardGrid}>
          {displayedBoards.map((board) => (
            <Link
              to={`/mytownBoard/${board.boardNo}`}
              key={board.boardNo}
              className={styles.boardCard}
            >
<img
  className={styles.thumbnail}
  src={
    (board.thumbnail ? board.thumbnail.replace(/\/{2,}/g, "/") : "/default-thumbnail.png")
  }
  alt="썸네일"
/>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{board.boardTitle}</h3>

  {/* ✅ 해시태그 추가 */}
  <div className={styles.tagContainer}>
    {generateTagList(board).map((tag, idx) => (
      <span key={idx} className={styles.tag}>#{tag}</span>
    ))}
  </div>
                  <p className={styles.cardText}>
                  {stripHtml(board.boardContent)}
                </p>
 {/* ✅ 별점 + 작성일: 후기 유형일 때만 표시 */}
  {(board.postType === "복지혜택후기" || board.postType === "복지시설후기") && (
    <div className={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= board.starCount ? 'orange' : '#ddd' }}>★</span>
      ))}
      <span style={{ marginLeft: "10px", fontSize: "13px", color: "#666" }}>
        {board.boardDate}
      </span>
    </div>
  )}

                <div className={styles.userInfo}>
                  <img
                    className={styles.profileImg}
                    src={board.memberImg || "/default-profile.png"}
                    alt="프로필"
                  />
                  <span>{board.memberNickname}</span>
                </div>
                   <div className={styles.iconInfo}>
      <span style={{ marginRight: "8px" }}>❤️ {board.likeCount}</span>
      <span>|</span>
      <span>조회 {board.boardReadCount}</span>
    </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.noResults}>😥 해당하는 게시물이 없습니다.</p>
      )}

      {/* --- 페이지네이션 (원본 유지) --- */}
<div className={styles.paginationContainer}>
  {pagination && pagination.maxPage > 1 && (
    <>
      <button onClick={() => setCurrentPage(1)} disabled={currentPage <= 1}>
        &laquo;
      </button>
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage <= 1}
      >
        &lt;
      </button>
      {Array.from({ length: pagination.maxPage }, (_, i) => i + 1).map(
        (num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={num === currentPage ? styles.activePage : ""}
          >
            {num}
          </button>
        )
      )}
      <button
        onClick={() => setCurrentPage((p) => Math.min(pagination.maxPage, p + 1))}
        disabled={currentPage >= pagination.maxPage}
      >
        &gt;
      </button>
      <button
        onClick={() => setCurrentPage(pagination.maxPage)}
        disabled={currentPage >= pagination.maxPage}
      >
        &raquo;
      </button>
    </>
  )}
</div>
    </div>
  );
}

export default MyTownBoard;
