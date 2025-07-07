import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateTagList } from "../../utils/tagUtils";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "../../styles/comment/Comment.css";
import CommentModal from "./../comment/CommentModal";
import CommentSection from "../comment/Comment";

function MyTownBoardDetail() {
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0); // 초기값 0
  const [liked, setLiked] = useState(false); // 초기값 false
  const [boardCode, setBoardCode] = useState(3); // boardCode 가 3이면 우리지역 게시판
  const [modalVisible, setModalVisible] = useState(false); // 모달 보이게 할지 말지
  const [selectedMember, setSelectedMember] = useState(null); // 신고할 대상 선택하기
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 }); // 모달창이 어디가 뜨게 할지 기본값

  // const {regionCity, regionDistrict } = useAuthStore();
  const writerNo = board?.memberNo; // 게시글 작성자 번호
  const { token, role, authority, memberNo: loginMemberNo } = useAuthStore(); // 로그인한 사용자 번호
  const navigate = useNavigate();

  const handleLike = async () => {
    if (loginMemberNo === writerNo) {
      alert("본인의 글에는 좋아요를 누를 수 없습니다.");
      return;
    }

    try {
      const res = await axios.post(
        `/api/board/mytownBoard/${board.boardNo}/like`,
        null,
        {
          params: {
            memberNo: loginMemberNo,
            writerNo: writerNo,
          },
        }
      );

      if (res.data === "liked") {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const memberParam = loginMemberNo ? `?memberNo=${loginMemberNo}` : "";

    fetch(`/api/board/mytownBoard/${boardNo}${memberParam}`)
      .then((res) => res.json())
      .then((data) => {
        setBoard(data);
        setLikeCount(data.likeCount);
        setLiked(data.likeCheck === 1); // ✅ 서버에서 내려온 likeCheck 사용
      })
      .catch((err) => console.error("Error:", err));
  }, [boardNo, loginMemberNo]);

  if (!board) return <p>로딩 중...</p>; // ✅ null 방지

  // 이미지 경로가 상대경로인 경우 절대경로로 교체
  const contentWithImages = board.boardContent.replaceAll(
    /<img src="\/images\/board\//g,
    "http://localhost:8080/images/board/"
  );
  const tagList = generateTagList(board);

  console.log("selectedMember:", selectedMember);
  return (
    <div>
      <h2>{board.boardTitle}</h2>
      <img
        src={board.memberImg || "/default-profile.png"}
        alt="프로필 사진"
        className="profile-img"
        onClick={(e) => {
          setSelectedMember({
            memberImg: board.memberImg,
            memberNickname: board.memberNickname,
            memberNo: board.memberNo,
            role: board.authority === "2" ? "ADMIN" : "USER",
          });
          setModalPosition({ x: e.clientX + 50, y: e.clientY });
          setModalVisible(true);
        }}
      />
      <p>
        <strong>작성자:</strong> {board.memberNickname}
      </p>
      <p>
        <strong>작성일:</strong> {board.boardDate}
      </p>
      <p>
        <strong>지역:</strong> {board.regionCity} {board.regionDistrict}
      </p>

      <span>조회수{board.boardReadCount}</span>

      <button
        onClick={handleLike}
        style={{
          marginLeft: "10px",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {liked ? "❤️" : "🤍"} {likeCount}
      </button>
      <div>
        {!(board.postType === "자랑" || board.postType === "자유") && (
          <span>⭐ {board.starCount ?? 0}</span>
        )}
      </div>

      {board.content}

      {/* ✅ 글 내용과 이미지가 섞인 HTML 출력 */}
      <div
        className="board-content"
        dangerouslySetInnerHTML={{ __html: contentWithImages }}
      />

      {/* 해시태그 표시 */}
      <div style={{ marginTop: "10px", color: "#3b5998" }}>
        {tagList.map((tag, idx) => (
          <span key={idx}>#{tag} </span>
        ))}
      </div>

      {/* ✅ 목록으로 돌아가기 버튼 */}
      <button onClick={() => navigate("/mytownBoard")}>
        목록으로 돌아가기
      </button>

      {loginMemberNo === writerNo && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate(`/mytownBoard/update/${board.boardNo}`)}
            className="write-btn"
          >
            수정하기
          </button>

          <button
            onClick={async () => {
              if (window.confirm("정말 삭제하시겠습니까?")) {
                try {
                  await axios.delete(
                    `/api/editboard/mytown/${board.boardNo}/delete`,
                    {
                      params: { memberNo: loginMemberNo },
                    }
                  );
                  alert("삭제가 완료되었습니다.");
                  navigate("/mytownBoard");
                } catch (err) {
                  console.error(err);
                  alert("삭제에 실패했습니다.");
                }
              }
            }}
          >
            삭제하기
          </button>
        </div>
      )}
      <CommentSection
        boardCode={boardCode}
        boardNo={boardNo}
        token={token}
        loginMemberNo={loginMemberNo}
        role={role}
      />

      {modalVisible &&
        selectedMember &&
        selectedMember.role !== "ADMIN" && ( // 작성자가 관리자일 경우 모달 안 뜨게
          <CommentModal
            member={selectedMember}
            position={modalPosition}
            onClose={() => setModalVisible(false)}
          />
        )}
    </div>
  );
}

export default MyTownBoardDetail;
