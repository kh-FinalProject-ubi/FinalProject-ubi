import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateTagList } from "../../utils/tagUtils";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "../../styles/comment/Comment.css";
import CommentModal from "./../comment/CommentModal";
import CommentSection from "../comment/Comment";
import { Navigate } from "react-router-dom";

function MyTownBoardDetail() {
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0); // 초기값 0
  const [liked, setLiked] = useState(false); // 초기값 false
  const [boardCode, setBoardCode] = useState(3); // boardCode 가 3이면 우리지역 게시판
  const [modalVisible, setModalVisible] = useState(false); // 모달 보이게 할지 말지
  const [selectedMember, setSelectedMember] = useState(null); // 신고할 대상 선택하기
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 }); // 모달창이 어디가 뜨게 할지 기본값
  const [reportedByMe, setReportedByMe] = useState(false); // 게시글이 신고됐을 때 신고상태 보여주기

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

  // 게시글 신고
  const handleReport = async (boardNo) => {
    try {
      const res = await axios.post(
        `/api/board/mytownBoard/${boardNo}/report`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const reported = res.data.reported;
      if (reported === true) {
        alert("신고 성공");
        setReportedByMe(true);
      } else if (reported === false) {
        alert("신고 취소 완료");
        setReportedByMe(false);
      } else {
        alert("알 수 없는 응답입니다");
      }
    } catch (err) {
      console.error("신고 실패:", err.response?.data || err.message);
      alert("신고 실패");
    }
  };
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/mytownBoard", { replace: true });
      return;
    }

    const memberParam = loginMemberNo ? `?memberNo=${loginMemberNo}` : "";

    console.log("요청 전 loginMemberNo:", loginMemberNo, "token:", token);
    fetch(`/api/board/mytownBoard/${boardNo}${memberParam}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        setBoard(data);
        setLikeCount(data.likeCount);
        setLiked(data.likeCheck === 1);
        setReportedByMe(data.reportedByMe === "Y");
        console.log(" 서버 응답:", data);
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("게시글을 불러오는 중 오류가 발생했습니다.");
        navigate("/mytownBoard");
      });
  }, [boardNo, loginMemberNo, navigate, token]);

  if (!board) return <p>게시글을 불러오는 중입니다...</p>;

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
        src={
          `http://localhost:8080${board.memberImg}` || "/default-profile.png"
        }
        alt="프로필 사진"
        className="profile-img"
        onClick={(e) => {
          setSelectedMember({
            memberNo: board.memberNo,
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

      {/* 신고 버튼 */}
      {token && loginMemberNo !== writerNo && (
        <button
          className="report-btn"
          onClick={() => handleReport(board.boardNo)}
        >
          <img
            src={reportedByMe ? "/boardCancleReport.svg" : "/boardReport.svg"}
            alt="신고 아이콘"
          />
        </button>
      )}
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
        selectedMember.role !== "ADMIN" &&
        selectedMember.memberNo !== loginMemberNo && ( // 작성자가 관리자일 경우 모달 안 뜨게
          <CommentModal
            member={selectedMember}
            token={token}
            position={modalPosition}
            onClose={() => setModalVisible(false)}
          />
        )}
    </div>
  );
}

export default MyTownBoardDetail;
