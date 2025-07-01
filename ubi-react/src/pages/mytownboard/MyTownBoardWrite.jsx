import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite";
import useAuthStore from "../../stores/useAuthStore";
import WelfareFacilityModal from "./WelfareFacilityModal";
import Modal from "../../components/common/Modal";

const MyTownBoardWrite = () => {
  const { memberNo, address } = useAuthStore();
  const [boardTitle, setTitle] = useState("");
  const [boardContent, setContent] = useState("");
  const navigate = useNavigate();
  const [hashtags, setHashtags] = useState("");
  const [postTypeCheck, setPostTypeCheck] = useState(""); // 단일 선택
  // ✅ HTML 태그 제거 (순수 텍스트 추출)
  const plainContent = boardContent.replace(/<[^>]+>/g, "").trim();
const postTypeCheckOptions = ["자유", "자랑","복지시설후기","복지혜택후기"];
const [starRating, setStarRating] = useState(0); // ⭐ 추가
//const [showModal, setShowModal] = useState(false);

 const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
const [selectedFacilityName, setSelectedFacilityName] = useState("");
const [selectedFacilityId, setSelectedFacilityId] = useState("");
const uploadedImagesRef = useRef([]); // 이미지 경로 저장용
  const handleSubmit = () => {
    //1. 입력하지 않는 경우 alert
    if (!boardTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!boardContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    // ✅ 해시태그 유효성 검사
  if (hashtags.trim() !== "" && !hashtags.trim().startsWith("#")) {
    alert("해시태그는 반드시 #으로 시작해야 합니다.");
    return;
  }

  // 2. 데이터 가공 
  // 2-1) #단어 #단어 → ['단어', '단어']
  const hashtagList = 
  hashtags
    .split("#")
    .map(tag => tag.trim())
    .filter(tag => tag !== "")
    ;
  
  // 2-2) 
  // 선택값에 따라 postType 값 가공
let postType = "";
if (postTypeCheck === "자랑") postType = "자랑";
else if (postTypeCheck === "자유") postType = "자유";
else if (postTypeCheck === "복지시설후기" || postTypeCheck === "복지혜택후기") postType = "후기"; 

// 2-3) 별점 alert
if (
  (postTypeCheck === "복지시설후기" || postTypeCheck === "복지혜택후기") &&
  starRating === 0
) {
  alert("별점을 선택해주세요.");
  return;
}

// 글쓰기 전송 내부 추가
const imageList = uploadedImagesRef.current.map((url, index) => ({
  imagePath: url,
  imageOrder: index,
  imageName: url.split("/").pop(), // 파일명만 추출
}));

  // 3. 글쓰기 전송
    // 서버로 전송 (예: POST api/editboard/mytown/write)
    fetch("/api/editboard/mytown/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        boardTitle, 
         boardContent: plainContent, //정제
       memberNo,
         postType,  
        hashtagList,  // ✅ 배열 형태로 전송
        starCount: starRating, // ⭐ 포함
facilityApiServiceId: selectedFacilityId || null, // 선택 안했을 경우 null
imageList
      }),
    })
        .then(async res => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`서버 오류: ${res.status} \n${errorText}`);
    }
    return res.json();
  })
      .then(data => {
        if (data && data.boardNo) {
          navigate(`/mytownBoard/${data.boardNo}`);
        } else {
          alert("작성에 실패했습니다.");
        }
       })
  .catch(err => {
    console.error("글쓰기 실패:", err.message);
    console.log("title:", boardTitle);
console.log("content:", boardContent);
console.log("memberNo:", memberNo);
console.log("hashtags:", hashtags);
    alert("서버 오류 발생. 콘솔 로그 확인");
  });
  };

  // 썸머노트 설정
  React.useEffect(() => {
    $("#summernote").summernote({
      height: 300,
     
      callbacks: {
      onChange: function (contents) {
        setContent(contents);
      },

       onImageUpload: function (files) {
        const formData = new FormData();
        formData.append("image", files[0]);

        fetch("/api/editboard/mytown/uploadImage", {
          method: "POST",
          body: formData,
        })
          .then(res => res.text())
          .then(imageUrl => {
            $("#summernote").summernote("insertImage", imageUrl, "image");

              uploadedImagesRef.current.push(imageUrl);
          })
          .catch(err => {
            alert("이미지 업로드 실패");
            console.error(err);
          });
      },
    },

       // 툴바 
       toolbar: [
      ['style', ['bold', 'italic', 'underline']],
      ['para', ['ul', 'ol']],
      ['insert', ['link', 'picture']], // video, table 제거
      ['misc', ['undo', 'redo']] // codeview, fullscreen 제거
    ],
    });
  }, []);


  return (
    <div>
      <h3>우리 동네 좋아요</h3>
      <br/>

<div className="post-option-box">
<p>
  작성자 지역: {address}
</p>
 <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
  <tbody>
    {/* 작성 유형 */}
   <tr>
  <th>작성유형</th>
  <td style={{ whiteSpace: "nowrap" }}>
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
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

          {/* 선택된 유형일 때 버튼 표시 */}
          {postTypeCheck === type && (
            <>
              {type === "복지시설후기" && (
                <>
                  <button onClick={() => setShowFacilityModal(true)} style={{ marginLeft: "10px" }}>
                    복지시설 선택
                  </button>
                  {selectedFacilityName && (
                    <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                      선택: {selectedFacilityName}
                    </span>
                  )}
                </>
              )}
              {type === "복지혜택후기" && (
                <button onClick={() => setShowBenefitModal(true)} style={{ marginLeft: "10px" }}>
                  복지혜택 선택
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  </td>
</tr>
{(postTypeCheck === "복지시설후기" || postTypeCheck === "복지혜택후기") && (
       <tr>
              <th>별점</th>
              <td>
                
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setStarRating(star)}
                    style={{ cursor: "pointer", color: starRating >= star ? "orange" : "lightgray", fontSize: "24px" }}
                  >
                    ★
                  </span>
                ))}
                 <span style={{ marginLeft: "10px" }}>{starRating ? `별점: ${starRating}점` : "선택 안됨"}</span>
              </td>
            </tr>
            )}

    {/* 해시태그 입력 */}
    <tr>
      <th >해시태그</th>
      <td >
        <input
          type="text"
          placeholder="#해시태그를 샵(#)으로 구분해 입력"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          style={{ width: "80%" }}
        />
      </td>
    </tr>

             
  </tbody>
</table>
  

  </div>



<br/><br/>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={boardTitle}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div id="summernote" />
      <button onClick={handleSubmit}>글쓰기 완료</button>
    </div>


  );
};



export default MyTownBoardWrite;