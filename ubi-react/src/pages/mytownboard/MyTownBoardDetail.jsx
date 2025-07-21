import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateTagList } from "../../utils/tagUtils";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import CommentModal from "./../comment/CommentModal";
import CommentSection from "../comment/Comment";
import { Navigate } from "react-router-dom";
import styles from "../../styles/board/BoardDetail.module.css";

function MyTownBoardDetail() {
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0); // 초기값 0
  const [liked, setLiked] = useState(false); // 초기값 false
  const [boardCode] = useState(3); // boardCode 가 3이면 우리지역 게시판
  const [modalVisible, setModalVisible] = useState(false); // 모달 보이게 할지 말지
  const [selectedMember, setSelectedMember] = useState(null); // 신고할 대상 선택하기
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 }); // 모달창이 어디가 뜨게 할지 기본값
  const [reportedByMe, setReportedByMe] = useState(false); // 게시글이 신고됐을 때 신고상태 보여주기
  // const [showDetail, setShowDetail] = useState(true);

  // const {regionCity, regionDistrict } = useAuthStore();
  const writerNo = board?.memberNo; // 게시글 작성자 번호
  const { token, role, memberNo: loginMemberNo } = useAuthStore(); // 로그인한 사용자 번호
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
      navigate(-1);
      return;
    }

    axios
      .get(`/api/board/mytownBoard/${boardNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = res.data;
        setBoard(data);
        setLikeCount(data.likeCount);
        setLiked(data.likeCheck === 1);
        setReportedByMe(data.reportedByMe === "Y");
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
    /src="\/images\/board\//g,
    'src="http://localhost:8080/images/board/'
  );
  const tagList = generateTagList(board);

  console.log("selectedMember:", selectedMember);
  return (
    <main className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* ✅ 상단 제목 + 작성유형 */}
       <div className={styles.titleAndTagRow}>
    <h2 className={styles.pageTitle}>우리 동네 좋아요</h2>

    {/* 오른쪽에 subtag */}
    {board.postType === "복지시설후기" && board.facilityName && (
      <span className={styles.subtag}>{board.facilityName}</span>
    )}
    {board.postType === "복지혜택후기" && board.welfareName && (
      <span className={styles.subtag}>{board.welfareName}</span>
    )}
  </div>

        <section>
          {/* ✅ 제목 + 수정/삭제 */}
          <div className={styles.boardHeader}>
            <div className={styles.titleContainer}>
              <div className={styles.titleGroup}>
                <h3 className={styles.boardTitle}>{board.boardTitle}</h3>
              </div>

              {(loginMemberNo === writerNo || role === "ADMIN") && (
                <div className={styles.buttonContainer}>
                  <button
                    onClick={() =>
                      navigate(`/mytownBoard/update/${board.boardNo}`)
                    }
                    className={styles.editButton}
                  >
                    수정
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm("정말 삭제하시겠습니까?")) {
                        try {
                          await axios.delete(
                            `/api/editboard/mytown/${board.boardNo}/delete`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
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
                    className={styles.deleteButton}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* ✅ 태그 목록 */}
          <div className={styles.tagList}>
            {tagList.map((tag, idx) => (
              <span
                key={idx}
                className={`${styles.tag} ${
                  idx === 0
                    ? styles.tagYellow
                    : idx === 1
                    ? styles.tagPurple
                    : styles.tagWhite
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className={styles.metaContainer}>
            {/* 작성자 정보 */}
            <div className={styles.userInfo}>
              <img
                 className={styles.profileImg}
                src={board.memberImg || "/default-profile.png"}
                alt="프로필"
                onError={(e) => {
                   e.currentTarget.src = "/default-profileerror.png";
                  e.currentTarget.onerror = null;
                  setSelectedMember({
                    memberNo: board.memberNo,
                    memberImg: board.memberImg,
                    memberNickname: board.memberNickname,
                    role: board.authority === "2" ? "ADMIN" : "USER",
                  });
                  setModalPosition({ x: e.clientX + 50, y: e.clientY });
                  setModalVisible(true);
                }}
              />
              <div className={styles.authorInfo}>
                <span className={styles.authorNickname}>
                  {board.memberNickname}
                </span>
                <span className={styles.boardDate}>{board.boardDate} 작성</span>
              </div>
            </div>

            {/* 좋아요 + 조회 + 신고 */}
            <div className={styles.statColumn}>
              {/* 신고 버튼만 위로 */}
              {token && loginMemberNo !== writerNo && board.authority !== "2" && (
  <button
    className={styles.reportBtn}
    onClick={() => handleReport(board.boardNo)}
  >
    <img
      src={
        reportedByMe
          ? "/boardCancleReport.svg"
          : "/boardReport.svg"
      }
      alt="신고 아이콘"
    />
  </button>
)}

              <div className={styles.stats}>
               <button onClick={handleLike} className={styles.likeButton}>
  <img
    src="/icons/boardlike.svg"
    alt="좋아요"
    className={styles.iconHeart}
  />
  <span className={styles.likeCount}> {likeCount}</span>
</button>
     <span className={styles.readCount}>조회 {board.boardReadCount}</span>
              </div>
            </div>
          </div>

          {/* ✅ 본문 */}
          <div
            className={styles.boardContent}
            dangerouslySetInnerHTML={{ __html: contentWithImages }}
          />

          {/* ✅ 별점 (후기 유형만 표시) */}
          {/* 별점 라벨 + 별점 박스 */}
          {(board.postType === "복지혜택후기" ||
            board.postType === "복지시설후기") && (
            <div className={styles.starContainer}>
              <label className={styles.starLabel}>별점</label>
              <div className={styles.starBox}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={
                        i <= board.starCount
                          ? "/icons/boardstar.svg"
                          : "/icons/boardnostar.svg"
                      }
                      alt="별점"
                      className={styles.iconStar}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ✅ 목록으로 돌아가기 */}
          <div className={styles.bottomButtonContainer}>
            <button
              className={styles.listButton}
              onClick={() => navigate("/mytownBoard")}
            >
              목록
            </button>
          </div>

          {/* ✅ 댓글 영역 */}
          <div className={styles.commentSection}>
            <CommentSection
              boardCode={boardCode}
              boardNo={boardNo}
              token={token}
              loginMemberNo={loginMemberNo}
              role={role}
            />
          </div>

          {/* ✅ 유저 정보 모달 */}
          {modalVisible &&
            selectedMember &&
            selectedMember.role !== "ADMIN" &&
            selectedMember.memberNo !== loginMemberNo && (
              <CommentModal
                member={selectedMember}
                token={token}
                position={modalPosition}
                onClose={() => setModalVisible(false)}
              />
            )}
        </section>
      </div>
    </main>
  );
}

export default MyTownBoardDetail;
