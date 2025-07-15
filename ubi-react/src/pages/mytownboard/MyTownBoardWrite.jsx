import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite";
import useAuthStore from "../../stores/useAuthStore";
import WelfareFacilityModal from "./WelfareFacilityModal";
import Modal from "../../components/common/Modal";
import LocalBenefitModal from "./LocalBenefitModal";

const MyTownBoardWrite = () => {
  const { memberNo, regionCity, regionDistrict } = useAuthStore();
  const [boardTitle, setTitle] = useState("");
  const [boardContent, setContent] = useState("");
  const navigate = useNavigate();
  const [hashtags, setHashtags] = useState("");
  const [postTypeCheck, setPostTypeCheck] = useState("");
  const postTypeCheckOptions = ["자유", "자랑", "복지시설후기", "복지혜택후기"];
  const [starRating, setStarRating] = useState(0);

  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedFacilityName, setSelectedFacilityName] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");

  const [selectedWelfare, setSelectedWelfare] = useState(null);
  const [selectedWelfareName, setSelectedWelfareName] = useState("");
  const [selectedBenefitId, setSelectedBenefitId] = useState("");

  const uploadedImagesRef = useRef([]);

  const handleSubmit = () => {
    const postType = postTypeCheck.trim();

    if (!boardTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    // ✅ 내용 체크: 텍스트와 이미지 둘 다 없으면 막기
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = boardContent;
    const textContent = tempDiv.textContent.trim();
    const hasImage = tempDiv.querySelector("img") !== null;

    if (!textContent && !hasImage) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!postTypeCheck) {
      alert("작성유형을 선택해주세요.");
      return;
    }

    if (hashtags.trim() !== "" && !hashtags.trim().startsWith("#")) {
      alert("해시태그는 반드시 #으로 시작해야 합니다.");
      return;
    }

    if (
      (postTypeCheck === "복지시설후기" || postTypeCheck === "복지혜택후기") &&
      starRating === 0
    ) {
      alert("별점을 선택해주세요.");
      return;
    }

    const hashtagList = hashtags
      .split("#")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const imageList = uploadedImagesRef.current.map((url, index) => {
      const segments = url.split("/");
      return {
        imagePath: "/" + segments.slice(0, -1).join("/"),
        imageOrder: index,
        imageName: segments[segments.length - 1],
      };
    });

    fetch("/api/editboard/mytown/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardTitle,
        boardContent,
        memberNo,
        postType,
        hashtagList,
        starCount: starRating,
        imageList,
        regionCity,
        regionDistrict,

        facilityApiServiceId:
          postType === "복지시설후기" ? selectedFacility?.serviceId : null,
        facilityName:
          postType === "복지시설후기" ? selectedFacility?.name : null,
        facilityKindCd:
          postType === "복지시설후기" ? selectedFacility?.category : null,
        facilityAddress:
          postType === "복지시설후기" ? selectedFacility?.address : null,

        apiServiceId:
          postType === "복지혜택후기" ? selectedWelfare?.serviceId : null,
        welfareName: postType === "복지혜택후기" ? selectedWelfare?.name : null,
        welfareAgency:
          postType === "복지혜택후기" ? selectedWelfare?.agency : null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`서버 오류: ${res.status} \n${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.boardNo) {
          navigate(`/mytownBoard/${data.boardNo}`);
        } else {
          alert("작성에 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("글쓰기 실패:", err.message);
        alert("서버 오류 발생. 콘솔 로그 확인");
      });
  };

  useEffect(() => {
    $("#summernote").summernote({
      height: 300,
      callbacks: {
        onChange: function (contents) {
          setContent(contents);
        },
        onImageUpload: function (files) {
          for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("image", files[i]);

            fetch("/api/editboard/mytown/uploadImage", {
              method: "POST",
              body: formData,
            })
              .then((res) => res.text())
              .then((imageUrl) => {
                $("#summernote").summernote("insertImage", imageUrl);
                uploadedImagesRef.current.push(imageUrl);
              })
              .catch((err) => {
                alert("이미지 업로드 실패");
                console.error(err);
              });
          }
        },
      },
      toolbar: [
        ["style", ["bold", "italic", "underline"]],
        ["para", ["ul", "ol"]],
        ["insert", ["link", "picture"]],
        ["misc", ["undo", "redo"]],
      ],
    });
  }, []);

  return (
    <div>
      <h3>우리 동네 좋아요</h3>
      <br />
      <div className="post-option-box">
        <p>
          작성자 지역: {regionCity} {regionDistrict}
        </p>
        <table
          border="1"
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <th>작성유형</th>
              <td style={{ whiteSpace: "nowrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  {postTypeCheckOptions.map((type) => (
                    <div key={type}>
                      <label>
                        <input
                          type="radio"
                          name="postTypeCheck"
                          value={type}
                          checked={postTypeCheck === type}
                          onChange={(e) => setPostTypeCheck(e.target.value)}
                        />
                        {type}
                      </label>

                      {postTypeCheck === type && (
                        <>
                          {type === "복지시설후기" && (
                            <>
                              <button
                                onClick={() => setShowFacilityModal(true)}
                                style={{ marginLeft: "10px" }}
                              >
                                복지시설 선택
                              </button>
                              {selectedFacilityName && (
                                <span
                                  style={{
                                    marginLeft: "10px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  선택: {selectedFacilityName}
                                </span>
                              )}
                            </>
                          )}
                          {type === "복지혜택후기" && (
                            <button
                              onClick={() => setShowBenefitModal(true)}
                              style={{ marginLeft: "10px" }}
                            >
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

            {(postTypeCheck === "복지시설후기" ||
              postTypeCheck === "복지혜택후기") && (
              <tr>
                <th>별점</th>
                <td>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setStarRating(star)}
                      style={{
                        cursor: "pointer",
                        color: starRating >= star ? "orange" : "lightgray",
                        fontSize: "24px",
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ marginLeft: "10px" }}>
                    {starRating ? `별점: ${starRating}점` : "선택 안됨"}
                  </span>
                </td>
              </tr>
            )}

            <tr>
              <th>해시태그</th>
              <td>
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

      <br />
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={boardTitle}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <div id="summernote" />
      <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
        글쓰기 완료
      </button>

      {showFacilityModal && (
        <Modal onClose={() => setShowFacilityModal(false)}>
          <WelfareFacilityModal
            city={regionCity}
            district={regionDistrict}
            onSelect={({ name, id, category, address }) => {
              setSelectedFacility({ serviceId: id, name, category, address });
              setSelectedFacilityName(name);
              setSelectedFacilityId(id);
              setShowFacilityModal(false);
            }}
            onClose={() => setShowFacilityModal(false)}
          />
        </Modal>
      )}

      {showBenefitModal && (
        <Modal onClose={() => setShowBenefitModal(false)}>
          <LocalBenefitModal
            isOpen={showBenefitModal}
            onClose={() => setShowBenefitModal(false)}
            onSelect={({ serviceId, name, agency }) => {
              setSelectedWelfare({ serviceId, name, agency });
              setSelectedWelfareName(name);
              setSelectedBenefitId(serviceId);
              setShowBenefitModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default MyTownBoardWrite;
