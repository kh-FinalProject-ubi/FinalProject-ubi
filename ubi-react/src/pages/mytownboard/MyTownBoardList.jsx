import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import cityDistrictMap from "../../constants/cityDistrictMap";
import { generateTagList } from "../../utils/tagUtils";
import styles from "../../styles/board/MyTownBoardList.module.css";

function MyTownBoard() {
  const navigate = useNavigate();
  const { memberNo } = useAuthStore();

  const [boardList, setBoardList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [postTypeCheck, setPostTypeCheck] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  
    // ✅ 여기에 popularTags 선언
  const [popularTags, setPopularTags] = useState([]);

  // ✅ 인기 해시태그 불러오기 useEffect
  useEffect(() => {
    fetch("/api/board/popular-tags")
      .then((res) => res.json())
      .then((tags) => {
        setPopularTags(tags);
      })
      .catch((err) => console.error("인기 태그 불러오기 실패:", err));
  }, []);

  const [searchType, setSearchType] = useState("titleContent"); // 기본은 제목+내용 검색
  const [searchTypeOpen, setSearchTypeOpen] = useState(false); // 토글 열기 여부

  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  
  useEffect(() => {
    const queryParams = new URLSearchParams({
      page: currentPage,
      postType: postTypeCheck,
      regionCity: selectedCity,
      regionDistrict: selectedDistrict,
      keyword: searchKeyword,
      tags: selectedTags.join(","),
    });

    if (searchType === "titleContent") {
      queryParams.set("keyword", searchKeyword);
      queryParams.delete("tags");
    } else if (searchType === "hashtag") {
      queryParams.set("tags", searchKeyword);
      queryParams.delete("keyword");
    }

    fetch(`/api/board/mytownBoard?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setBoardList(data.boardList);
        setPagination(data.pagination);
      })
      .catch((err) => console.error("Error:", err));
  }, [ currentPage,
 postTypeCheck,
    selectedCity,
    selectedDistrict,
    searchKeyword,
    selectedTags,
  ]);

const handleTagClick = (tag) => {
  const normalizedTag = tag.replace(/^#/, ""); // # 제거
  const isSelected = selectedTags.includes(normalizedTag);


 if (isSelected) { // 선택된 태그를 다시 누르면 해제
    setSelectedTags([]);
    setSearchKeyword("");
  } else {
  setSearchType("hashtag"); // 검색 타입을 해시태그로 전환
  setSearchKeyword(normalizedTag); // 키워드 입력값을 해당 태그로 설정
  setSelectedTags([normalizedTag]); // 선택된 태그 업데이트 (중복 방지용)
    }

  setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>우리 동네 좋아요</h2>

      {/* 검색창 */}
      <div className={styles.topSearchContainer}>
  {/* ✅ 드롭다운 기준을 잡기 위한 Wrapper */}
  <div className={styles.sortDropdownWrapper}>
          <button
            className={styles.sortButton}
            onClick={() => setSearchTypeOpen((prev) => !prev)}
          >
            {searchType === "titleContent" ? "제목+내용" : "해시태그"}
          </button>

         {searchTypeOpen && (
      <div className={styles.sortDropdown}
      >
        <button
          className={styles.sortDropdownItem}
          onClick={() => {
            setSearchType("titleContent");
            setSearchTypeOpen(false);
          }}
        >
          제목+내용
        </button>
        <button
         className={styles.sortDropdownItem}
          onClick={() => {
            setSearchType("hashtag");
            setSearchTypeOpen(false);
          }}
              >
                해시태그
              </button>
            </div>
          )}
        </div>

        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3Z"
            />
          </svg>
          <input
            type="text"
            placeholder={
              searchType === "titleContent" ? "제목+내용 검색" : "해시태그 검색"
            }
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* 필터 */}
 <div className={styles.filterContainer}>
  <h3 className={styles.filterTitle}>검색 필터</h3>
  <div className={styles.filterBox}>
    <table className={styles.filterTable}>
      <tbody>
        {/* 게시판 유형 */}
        <tr className={styles.filterRow}>
          <th className={styles.filterLabel}>게시판 유형</th>
          <td className={styles.filterContent}>
            {["자유", "자랑", "복지혜택후기", "복지시설후기"].map((type) => (
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
                {type === "자랑"
                  ? "우리 동네 자랑"
                  : type === "복지혜택후기"
                  ? "복지 혜택 후기"
                  : type === "복지시설후기"
                  ? "복지 시설 후기"
                  : type}
              </label>
            ))}
          </td>
        </tr>

        {/* 작성지역 */}
        <tr className={styles.filterRow}>
          <th className={styles.filterLabel}>작성지역</th>
          <td className={styles.filterContent}>
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
          </td>
        </tr>

        {/* 해시태그 */}
        <tr className={styles.filterRow}>
          <th className={styles.filterLabel}>해시태그</th>
          <td className={styles.filterContent}>
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
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


      {/* 글쓰기 버튼 */}
      {memberNo && (
        <div className={styles.writeButtonContainer}>
          <button
            onClick={() => navigate("/mytownBoard/write")}
            className={styles.writeButton}
          >
            글쓰기
          </button>
        </div>
      )}

      {/* 게시글 목록 */}
      {boardList.length > 0 ? (
        <div className={styles.boardGrid}>
          {boardList.map((board) => (
            <Link
              to={`/mytownBoard/${board.boardNo}`}
              key={board.boardNo}
              className={styles.boardCard}
            >
              <img
                className={styles.thumbnail}
                src={
                  board.thumbnail
                    ? board.thumbnail.replace(/\/{2,}/g, "/")
                    : "/default-thumbnail.png"
                }
                alt="썸네일"
              />
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{board.boardTitle}</h3>
                <div className={styles.tagContainer}>
                  {generateTagList(board).map((tag, idx) => (
                    <span key={idx} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className={styles.cardText}>
                  {stripHtml(board.boardContent)}
                </p>
                <div className={styles.ratingRow}>
                  {/* 후기 유형일 경우에만 별점 표시 */}
                  {(board.postType === "복지혜택후기" ||
                    board.postType === "복지시설후기") &&
                    [1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        style={{
                          color: i <= board.starCount ? "orange" : "#ddd",
                        }}
                      >
                        ★
                      </span>
                    ))}

                  {/* 작성일은 항상 표시 */}
                  <span className={styles.dateText}>{board.boardDate}</span>
                </div>
                <div className={styles.userInfo}>
                  <img
                    className={styles.profileImg}
                    src={board.profileImgImg || "/default-profile.png"}
                    alt="프로필"
                  />
                  <span>{board.memberNickname}</span>
                </div>
                <div className={styles.iconInfo}>
                  <span>❤️ {board.likeCount}</span>
                  <span style={{ marginLeft: "8px" }}>
                    조회 {board.boardReadCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.noResults}>😥 해당하는 게시물이 없습니다.</p>
      )}

      {/* 페이지네이션 */}
      <div className={styles.paginationContainer}>
        {pagination && pagination.maxPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1}
            >
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
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.maxPage, p + 1))
              }
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
