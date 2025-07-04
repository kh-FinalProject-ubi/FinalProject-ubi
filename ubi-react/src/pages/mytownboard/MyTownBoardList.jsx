import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateTagList } from '../../utils/tagUtils';
import useAuthStore from '../../stores/useAuthStore';
import cityDistrictMap from '../../constants/cityDistrictMap'; // 📌 전국 시군구 목록

function MyTownBoard() {
  const navigate = useNavigate();
  const { regionCity, regionDistrict } = useAuthStore();

  // 게시글 상태
  const [boardList, setBoardList] = useState([]);

  // 검색창 상태 추가
  const [searchKeyword, setSearchKeyword] = useState("");
const [searchType, setSearchType] = useState("제목");


  // 필터 상태
  const [postTypeCheck, setPostTypeCheck] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);


// 필터링된 게시글 목록
const filteredBoards = boardList.filter((board) => {
  const matchPostType = !postTypeCheck || board.postType === postTypeCheck;

  const matchRegion =
    !selectedCity ||
    (board.regionCity === selectedCity &&
      (!selectedDistrict || board.regionDistrict === selectedDistrict));

  const keyword = searchKeyword.trim().toLowerCase();

 const matchSearch = !keyword || (() => {
  switch (searchType) {
    case "제목":
      return board.boardTitle?.toLowerCase().includes(keyword);
    case "내용":
      return board.boardContent?.toLowerCase().includes(keyword);
    case "해시태그": {
      const tags = generateTagList(board).map((tag) => tag.toLowerCase());
      return tags.some((tag) => tag.includes(keyword));
    }
    default:
      return true;
  }
})();


  return matchPostType && matchRegion && matchSearch;
});


  // 페이지네이션 정보
const totalItems = filteredBoards.length;
const itemsPerPage = 5;
const maxPage = Math.ceil(totalItems / itemsPerPage);

// 현재 페이지에서 보여줄 게시글
const displayedBoards = filteredBoards.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);





  // HTML 제거 유틸
  const stripHtml = (html) => {
    if (!html) return "";
    const noImg = html.replace(/<img[^>]*>/gi, "");
    const doc = new DOMParser().parseFromString(noImg, 'text/html');
    const text = doc.body.textContent || "";
    return text.length > 25 ? text.slice(0, 25) + "..." : text;
  };

  // 게시글 전체 조회
  useEffect(() => {
    fetch(`/api/board/mytownBoard`)
      .then((res) => res.json())
      .then((data) => setBoardList(data.boardList))
      .catch((err) => console.error("Error:", err));
  }, []);

  






  return (
    <div>
      <h2>📍 우리동네 게시판</h2> <h3>지역: {regionCity} {regionDistrict}</h3>

<h3>🔍 게시글 검색</h3>
<div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  <select
    value={searchType}
    onChange={(e) => {
      setSearchType(e.target.value);
          setSearchKeyword("");     
      setCurrentPage(1);
    }}
  >
    <option value="제목">제목</option>
    <option value="내용">내용</option>
    <option value="해시태그">해시태그</option>
  </select>
  <input
    type="text"
    placeholder="검색어를 입력하세요"
    value={searchKeyword}
    onChange={(e) => {
      setSearchKeyword(e.target.value);
      setCurrentPage(1);
    }}
    style={{ flex: 1 }}
  />
</div>



      <h3>검색필터</h3>
      <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <th>게시판 유형</th>
            <td>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {["자유", "자랑", "복지시설후기", "복지혜택후기"].map((type) => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="radio"
                      name="postTypeCheck"
                      value={type}
                      checked={postTypeCheck === type}
                         onClick={() => {
        // ✅ 다시 클릭하면 해제되도록
        if (postTypeCheck === type) {
          setPostTypeCheck(""); // 해제
        }
      }}
                      onChange={(e) => {
                        setPostTypeCheck(e.target.value);
                        setCurrentPage(1); // 페이지 초기화
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </td>
          </tr>

          <tr>
            <th>지역</th>
            <td>
              <div style={{ display: "flex", gap: "10px" }}>
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
                    <option key={city} value={city}>{city}</option>
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
                  {selectedCity && cityDistrictMap[selectedCity].map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

     <ul>
      {displayedBoards.map((board) => (
        <li key={board.boardNo} style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
          <h3><Link to={`/mytownBoard/${board.boardNo}`}>{board.boardTitle}</Link></h3>
          <img
            src={board.thumbnail ? board.thumbnail.replace(/\/{2,}/g, "/") : "/default-thumbnail.png"}
            alt="썸네일"
          />
          <p>
            <img src={board.memberImg || "/default-profile.png"} alt="프로필" width="40" height="40" style={{ borderRadius: "50%", marginRight: "10px" }} />
            {board.memberNickname}
          </p>
          <p>{stripHtml(board.boardContent)}</p>
          <p><strong>작성일:</strong> {board.boardDate}</p>
          <p><strong>지역:</strong> {board.regionCity} {board.regionDistrict}</p>
          <div>
            <span>조회수 {board.boardReadCount}</span>
            {!(board.postType === "자랑" || board.postType === "자유") && <span>⭐ {board.starCount ?? 0}</span>}
            <span style={{ marginLeft: "10px" }}>❤️ {board.likeCount}</span>
          </div>

           {/* 🔗 해시태그 클릭 */}
            <div style={{ marginTop: "5px", color: "#3b5998" }}>
              {generateTagList(board).map((tag, idx) => (
                <span
                  key={idx}
                  style={{ cursor: "pointer", marginRight: "5px" }}
                  onClick={() => {
                    setSearchType("해시태그");
                    setSearchKeyword(tag);
                    setCurrentPage(1);
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
        </li>
      ))}
    </ul>

 
    {/* 페이지네이션 */}
    <div style={{ marginTop: "20px" }}>
      <button onClick={() => setCurrentPage(1)} disabled={currentPage <= 1}>&laquo;</button>
      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage <= 1}>&lt;</button>
      {Array.from({ length: maxPage }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setCurrentPage(pageNum)}
          disabled={pageNum === currentPage}
          style={{ fontWeight: pageNum === currentPage ? "bold" : "normal", margin: "0 5px" }}
        >
          {pageNum}
        </button>
      ))}
      <button onClick={() => setCurrentPage(prev => Math.min(maxPage, prev + 1))} disabled={currentPage >= maxPage}>&gt;</button>
      <button onClick={() => setCurrentPage(maxPage)} disabled={currentPage >= maxPage}>&raquo;</button>
    </div>

      <button onClick={() => navigate("/mytownBoard/write")} className="write-btn">
        글쓰기
      </button>
    </div>
  );
}

export default MyTownBoard;
