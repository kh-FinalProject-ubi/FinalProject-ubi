import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateTagList } from '../../utils/tagUtils';
import useAuthStore from '../../stores/useAuthStore';
function MyTownBoard() {
  const [boards, setBoards] = useState([]);
    const navigate = useNavigate();
 const {regionCity, regionDistrict } = useAuthStore();

 // 검색 필터 
   const [postTypeCheck, setPostTypeCheck] = useState(""); // 단일 선택
 const postTypeCheckOptions = ["자유", "자랑","복지시설후기","복지혜택후기"];
 const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
const [selectedFacilityName, setSelectedFacilityName] = useState("");
const [selectedFacilityId, setSelectedFacilityId] = useState("");

 // page 상태 관리
const [page, setPage] = useState(1);
const [boardList, setBoardList] = useState([]);
const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetch(`/api/board/mytownBoard?page=${page}`)
      .then((res) => res.json())
      .then((data) =>  {
        setBoardList(data.boardList);
        setPagination(data.pagination);
  })
      .catch((err) => console.error("Error:", err));
  }, [page]);

  return (
    <div>
      <h2>📍 우리동네 게시판</h2> <h3>지역:{regionCity} {regionDistrict}</h3>

<h3>검색필터</h3>
     <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
  <tbody>
    <tr>
    <th>게시판 유형</th>
    <td>    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
      {postTypeCheckOptions.map((type) => (
        <div key={type} style={{ display: "flex", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="radio"
              name="postTypeCheck"
              value={type}
              checked={postTypeCheck === type}
              onChange={(e) => setPostTypeCheck(e.target.value)}
            />
            {type}
          </label>

   
        </div>
      ))}
    </div></td>
    </tr>

    <tr>
     <th>지역</th>
    <td> 준비중 </td>
    </tr>


    <tr>
     <th>해시태그</th>
    <td> 준비중 </td>
    </tr>
    
  </tbody>
</table>

      <ul>
        {boardList.map((board) => (
          <li
            key={board.boardNo}
            style={{ borderBottom: "1px solid #ccc", padding: "10px" }}
          >
            <h3>
              <Link to={`/mytownBoard/${board.boardNo}`}>
                {board.boardTitle}
              </Link>
            </h3>
          <img
  src={
    board.thumbnail
      ? board.thumbnail.replace(/\/{2,}/g, "/")  // ✅ 정규식으로 슬래시 2개 이상 제거
      : "/default-thumbnail.png"
  }
  alt="썸네일"
/>

            <p>
              <img
                src={board.memberImg || "/default-profile.png"}
                alt="프로필"
                width="40"
                height="40"
                style={{ borderRadius: "50%", marginRight: "10px" }}
              />{" "}
              {board.memberNickname}
            </p>
            <p>
              <div dangerouslySetInnerHTML={{ __html: board.boardContent }} />...
            </p>
            <p>
              <strong>작성일:</strong> {board.boardDate}
            </p>
            <p>
              <strong>지역:</strong> {board.regionCity} {board.regionDistrict}
            </p>

            <div>
              <span>조회수{board.boardReadCount}</span>
              {!(board.postType === "자랑" || board.postType === "자유") && (
              <span>⭐ {board.starCount ?? 0}</span>
                )}
              <span style={{ marginLeft: "10px" }}>❤️ {board.likeCount}</span>
            </div>

            {(() => {
              const tagList = generateTagList(board);
              return (
                <div style={{ marginTop: "5px", color: "#3b5998" }}>
                  {tagList.map((tag, idx) => (
                    <span key={idx}>#{tag} </span>
                  ))}
                </div>
              );
            })()}
          </li>
        ))}
      </ul>


      
      <button
        onClick={() => navigate("/mytownBoard/write")}
        className="write-btn"
      >
        글쓰기
      </button>

 {/* 페이지네이션 버튼 */}
<div style={{ marginTop: "20px" }}>
  {/* 맨 처음 페이지로 이동 */}
  <button
    onClick={() => setPage(1)}
    disabled={page <= 1}
  >
    &laquo;
  </button>

  {/* 한 페이지 뒤로 */}
  <button
    onClick={() => setPage(page - 1)}
    disabled={page <= 1}
  >
    &lt;
  </button>

  {Array.from(
    { length: (pagination.endPage || 0) - (pagination.startPage || 0) + 1 },
    (_, i) => {
      const pageNum = (pagination.startPage || 0) + i;
      return (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          disabled={pageNum === page}
          style={{
            fontWeight: pageNum === page ? "bold" : "normal",
            margin: "0 5px",
          }}
        >
          {pageNum}
        </button>
      );
    }
  )}

  {/* 한 페이지 앞으로 */}
  <button
    onClick={() => setPage(page + 1)}
    disabled={page >= pagination.maxPage}
  >
    &gt;
  </button>

  {/* 마지막 페이지로 이동 */}
  <button
    onClick={() => setPage(pagination.maxPage)}
    disabled={page >= pagination.maxPage}
  >
    &raquo;
  </button>
</div>


    </div>

    
  );
}

export default MyTownBoard;
