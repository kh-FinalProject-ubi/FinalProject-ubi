import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/mypage/Profile.css";
import useAuthStore from "../../stores/useAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import LoadingOverlay from "../../components/Loading";
import ProfileImgUploader from "./ProfileImgUploader";
import { div } from "framer-motion/client";
import DaumPostcode from "react-daum-postcode";
import { stripHtml } from "./striptHtml";

const parseMemberStandardCode = (code) => {

  
  switch (code) {
    case "A":
      return { main: "일반", isDisabled: true, isPregnant: true };
    case "B":
      return { main: "노인", isDisabled: true, isPregnant: true };
    case "C":
      return { main: "청년", isDisabled: true, isPregnant: true };
    case "D":
      return { main: "아동", isDisabled: true, isPregnant: true };

    case "E":
      return { main: "일반", isDisabled: false, isPregnant: true };
    case "F":
      return { main: "노인", isDisabled: false, isPregnant: true };
    case "G":
      return { main: "청년", isDisabled: false, isPregnant: true };
    case "H":
      return { main: "아동", isDisabled: false, isPregnant: true };

    case "I":
      return { main: "일반", isDisabled: true, isPregnant: false };
    case "J":
      return { main: "노인", isDisabled: true, isPregnant: false };
    case "K":
      return { main: "청년", isDisabled: true, isPregnant: false };
    case "L":
      return { main: "아동", isDisabled: true, isPregnant: false };

    case "0":
      return { main: "일반", isDisabled: false, isPregnant: false };
    case "1":
      return { main: "노인", isDisabled: false, isPregnant: false };
    case "2":
      return { main: "청년", isDisabled: false, isPregnant: false };
    case "3":
      return { main: "아동", isDisabled: false, isPregnant: false };

    default:
      return { main: "일반", isDisabled: false, isPregnant: false };
  }
};

const Profile = () => {
  const { memberNo } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  const { token } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  const [loading, setLoading] = useState(false);

  const [member, setMember] = useState(null);
  const [zipcode, setZipcode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const [zipcode2, setZipcode2] = useState("");
  const [baseAddress2, setBaseAddress2] = useState("");
  const [detailAddress2, setDetailAddress2] = useState("");
  const [addressTarget, setAddressTarget] = useState("main");

  const [memberStandard, setMemberStandard] = useState("0");
  const [mainType, setMainType] = useState(null); // 라디오
  const [disabled, setDisabled] = useState(false); // 체크박스
  const [pregnant, setPregnant] = useState(false); // 체크박스
  const parsed = parseMemberStandardCode(member?.memberStandard || "0");

  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const detailAddressRef = useRef(null);

  const [benefits, setBenefits] = useState([]);
  const [category, setCategory] = useState("시설"); // or '채용', '혜택', '시설'

  const [board, setBoard] = useState([]);
  const [contentType, setContentType] = useState("게시글"); // or '댓글'

  const [like, setlike] = useState([]);
  const [commentContentType, setCommentContentType] = useState("게시글"); // or '댓글'

  // 로딩
  const withLoading = async (taskFn) => {
    setLoading(true);
    try {
      await taskFn(); // 단일 작업 실행
    } catch (e) {
      console.error("로딩 중 에러", e);
    } finally {
      setLoading(false);
    }
  };

  // 내 기본 정보
  const getMemberData = async () => {
    try {
      const res = await axios.get('/api/myPage/info', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        console.log("기본정보 응답 값:", res.data);
        setMember(res.data);

        // 상태 갱신 (memberImg 기존 값 유지)
        const { setAuth, ...stateOnly } = useAuthStore.getState();

        useAuthStore.getState().setAuth({
          ...stateOnly,
          memberImg: res.data.memberImg ?? stateOnly.memberImg,
        });

        const { main, isDisabled, isPregnant } = parseMemberStandardCode(
          res.data.memberStandard
        );

        setMemberStandard(res.data.memberStandard);
        setMainType(main);
        setDisabled(isDisabled);
        setPregnant(isPregnant);
      }
    } catch (err) {
      console.error("기본정보 조회 중 예외 발생 : ", err);
    }
  };


  // 내 정보 수정
  const saveMemberData = async () => {
    try {
      const fullAddress = `${zipcode}^^^${baseAddress}^^^${detailAddress}`;
      const fullAddress2 = `${zipcode2}^^^${baseAddress2}^^^${detailAddress2}`;

      const code = getMemberStandardCode(mainType, disabled, pregnant);
      console.log("저장되는 코드:", code);

      const payload = {
        ...member,
        memberAddress: fullAddress,
        memberTaddress: fullAddress2,
        memberStandard: code,
      };

      console.log("저장 payload:", payload);

      const res = await axios.post("/api/myPage/update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 저장 성공 확인
      if (res.status === 200) {
        alert("수정되었습니다.");
        await getMemberData(); // ⬅️ 최신 데이터 다시 가져오기
        setEditMode(false);
      } else {
        alert("수정에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("수정에 실패했습니다.");
    }
  };

  // 혜택 목록
  const getBenefitsData = async () => {
    try {
      // console.log("혜택 axios 요청 시작");
      const res = await axios.get("/api/myPage/service", {
        params: { memberNo: memberNo, category: category },
      });
      console.log("혜택 응답 받음:", res);
      // console.log("혜택 응답 값:", res.data);

      if (res.status === 200) {
        setBenefits(res.data);
      }
    } catch (err) {
      console.error("혜택목록 조회 중 예외 발생 : ", err);
    }
  };

  // 내가 작성한 게시글/댓글 목록
  const getBoardData = async () => {
    try {
      // console.log("작성글 axios 요청 시작");
      const res = await axios.get("/api/myPage/board", {
        params: { memberNo: memberNo, contentType: contentType },
      });
      console.log("작성글 응답 받음:", res);
      // console.log("작성글 응답 값:", res.data);

      if (res.status === 200) {
        setBoard(res.data);
      }
    } catch (err) {
      console.error("작성글 목록 조회 중 예외 발생 : ", err);
    }
  };

  // 내가 좋아요를 누른 게시글 목록
  const getLikeData = async () => {
    try {
      // console.log("좋아요 axios 요청 시작");
      const res = await axios.get("/api/myPage/like", {
        params: { memberNo: memberNo, contentType: commentContentType },
      });
      console.log("좋아요 응답 받음:", res);
      // console.log("좋아요 응답 값:", res.data);

      if (res.status === 200) {
        setlike(res.data);
      }
    } catch (err) {
      console.error("좋아요 목록 조회 중 예외 발생 : ", err);
    }
  };

  const fetchData = async () => {
    await withLoading(async () => {
      await getMemberData(); // 멤버 상태 저장
      await getBenefitsData(); // 혜택
      await getBoardData(); // 게시글 or 댓글
      await getLikeData(); // 좋아요
    });
  };

  // 주소 분리
  useEffect(() => {
    if (typeof member?.memberAddress === "string" && member.memberAddress) {
      const [zip, base, detail] = member.memberAddress.split("^^^");
      setZipcode(zip);
      setBaseAddress(base);
      setDetailAddress(detail);
      console.log("기본 주소 분리됨:", zip, base, detail);
    } else {
      // 주소 없으면 빈값 초기화
      setZipcode("");
      setBaseAddress("");
      setDetailAddress("");
    }
  }, [member]);

  // 임시 주소 분리
  useEffect(() => {
    if (typeof member?.memberTaddress === "string" && member.memberTaddress) {
      const [zip, base, detail] = member.memberTaddress.split("^^^");
      setZipcode2(zip);
      setBaseAddress2(base);
      setDetailAddress2(detail);
      console.log("임시 주소 분리됨:", zip, base, detail);
    } else {
      // 주소 없으면 빈값 초기화
      setZipcode2("");
      setBaseAddress2("");
      setDetailAddress2("");
    }
  }, [member]);

  // 주소 수정
  const openPostcodePopup = (target) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
          if (data.bname !== "") {
            extraAddress += data.bname;
          }
          if (data.buildingName !== "") {
            extraAddress +=
              extraAddress !== ""
                ? `, ${data.buildingName}`
                : data.buildingName;
          }
          if (extraAddress !== "") {
            fullAddress += ` (${extraAddress})`;
          }
        }

        if (target === "main") {
          setZipcode(data.zonecode);
          setBaseAddress(fullAddress);
        } else if (target === "temp") {
          setZipcode2(data.zonecode);
          setBaseAddress2(fullAddress);
        }

        if (detailAddressRef.current) {
          detailAddressRef.current.focus();
        }
      },
    }).open();
  };

  const handleEdit = () => {
    // memberStandard 값 파싱
    const parsed = parseMemberStandardCode(member.memberStandard);

    setMainType(parsed.main || "일반");
    setDisabled(parsed.isDisabled);
    setPregnant(parsed.isPregnant);

    setEditMode(true);
  };

  const getMemberStandardCode = (main, isDisabled, isPregnant) => {
    console.log("코드 생성 파라미터:", main, isDisabled, isPregnant);
    if (main === "일반" && isDisabled && isPregnant) return "A";
    if (main === "노인" && isDisabled && isPregnant) return "B";
    if (main === "청년" && isDisabled && isPregnant) return "C";
    if (main === "아동" && isDisabled && isPregnant) return "D";

    if (main === "일반" && isPregnant) return "E";
    if (main === "노인" && isPregnant) return "F";
    if (main === "청년" && isPregnant) return "G";
    if (main === "아동" && isPregnant) return "H";

    if (main === "일반" && isDisabled) return "I";
    if (main === "노인" && isDisabled) return "J";
    if (main === "청년" && isDisabled) return "K";
    if (main === "아동" && isDisabled) return "L";

    if (main === "일반") return "0";
    if (main === "노인") return "1";
    if (main === "청년") return "2";
    if (main === "아동") return "3";
  };

  const onProfileSave = async () => {
    await getMemberData(); // 최신 프로필 데이터 다시 불러오기
    alert("프로필 사진이 변경되었습니다!"); // 알림창 띄우기
  };

  useEffect(() => {
    if (member?.memberStandard) {
      const { main, isDisabled, isPregnant } = parseMemberStandardCode(
        member.memberStandard
      );
      setMainType(main);
      setDisabled(isDisabled);
      setPregnant(isPregnant);
    }
  }, [member]);

  // const getMemberStandardLabel = (code) => {
  //   const { main, isDisabled, isPregnant } = parseMemberStandardCode(code);

  //   let labels = [];

  //   if (main) {
  //     labels.push(main);
  //   } else {
  //     labels.push("일반");
  //   }

  //   if (isDisabled) {
  //     labels.push("장애인");
  //   }

  //   if (isPregnant) {
  //     labels.push("임산부");
  //   }

  //   return labels.join(", ");
  // };

  const location = useLocation();

  useEffect(() => {
    console.log("✅ useEffect 진입함");
    if (!memberNo) {
      console.log("❌ memberNo 없음");
      return;
    }
    console.log("🔥 fetchData 호출 준비");
    fetchData();
  }, [location.pathname, memberNo, category, contentType, commentContentType]);

  const handleClick = (benefit) => {
    const servId = benefit.apiServiceId.replace("bokjiro-", "");

    navigate(`/welfareDetail/${servId}`, {
      state: { data: benefit }, // ✅ 상세 페이지에서 받는 location.state.data
    });
  };

  return (
    <div className="mypage-profile">
      <h2>내 정보</h2>

      {member && (
        <section className="basic-info">
          <div style={{ position: "relative" }}>
            {loading && <LoadingOverlay />}
            <h3>기본 정보</h3>
            <div className="profile-left">
              <ProfileImgUploader member={member} onSave={onProfileSave} />
            </div>
            <div className="profile-right">
              <ul>
                {editMode ? (
                  <>
                    <li>
                      <strong>아이디</strong>
                      <input
                        type="text"
                        value={member.memberId}
                        onChange={(e) =>
                          setMember({ ...member, memberId: e.target.value })
                        }
                      />
                    </li>
                    <li>
                      <strong>카카오 아이디</strong>
                      <p>{member.kakaoId ? "연동 가능" : "없음"}</p>
                    </li>
                    <li>
                      <strong>닉네임</strong>
                      <input
                        type="text"
                        value={member.memberNickname}
                        onChange={(e) =>
                          setMember({
                            ...member,
                            memberNickname: e.target.value,
                          })
                        }
                      />
                    </li>
                    <li>
                      <strong>전화번호</strong>
                      <input
                        type="text"
                        value={member.memberTel}
                        onChange={(e) =>
                          setMember({ ...member, memberTel: e.target.value })
                        }
                      />
                    </li>
                    <li>
                      <strong>이메일</strong>
                      <input
                        type="text"
                        value={member.memberEmail}
                        onChange={(e) =>
                          setMember({ ...member, memberEmail: e.target.value })
                        }
                      />
                    </li>
                    <li>
                      <strong>회원 유형</strong>
                      {/* 라디오 버튼 */}
                      <div>
                        {["일반", "노인", "청년", "아동"].map((type) => (
                          <label key={type}>
                            <input
                              type="radio"
                              name="mainType"
                              value={type}
                              checked={mainType === type}
                              onChange={() => setMainType(type)}
                            />
                            {type}
                          </label>
                        ))}
                      </div>

                      {/* 체크박스 */}
                      <div>
                        <label>
                          <input
                            type="checkbox"
                            checked={disabled}
                            onChange={(e) => setDisabled(e.target.checked)}
                          />
                          장애인
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={pregnant}
                            onChange={(e) => setPregnant(e.target.checked)}
                          />
                          임산부
                        </label>
                      </div>
                    </li>
                    <li>
                      <strong>가입일</strong>
                      <input
                        type="text"
                        value={member.enrollDate}
                        onChange={(e) =>
                          setMember({ ...member, enrollDate: e.target.value })
                        }
                      />
                    </li>
                    <li>
                      <strong>주소</strong>
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            openPostcodePopup("main");
                          }}
                        >
                          우편번호 검색
                        </button>

                        <input
                          value={zipcode}
                          placeholder="우편번호"
                          readOnly
                          style={{
                            backgroundColor: "#f1f1f1",
                            cursor: "default",
                          }}
                        />

                        <input
                          value={baseAddress}
                          placeholder="기본 주소"
                          readOnly
                          style={{
                            backgroundColor: "#f1f1f1",
                            cursor: "default",
                          }}
                        />

                        <input
                          ref={detailAddressRef}
                          value={detailAddress}
                          onChange={(e) => setDetailAddress(e.target.value)}
                          placeholder="상세 주소"
                        />
                      </>
                    </li>

                    <li>
                      <strong>임시주소</strong>
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            openPostcodePopup("temp");
                          }}
                        >
                          우편번호 검색
                        </button>

                        <input
                          value={zipcode2}
                          placeholder="우편번호"
                          readOnly
                          style={{
                            backgroundColor: "#f1f1f1",
                            cursor: "default",
                          }}
                        />

                        <input
                          value={baseAddress2}
                          placeholder="기본 주소"
                          readOnly
                          style={{
                            backgroundColor: "#f1f1f1",
                            cursor: "default",
                          }}
                        />

                        <input
                          ref={detailAddressRef}
                          value={detailAddress2}
                          onChange={(e) => setDetailAddress2(e.target.value)}
                          placeholder="상세 주소"
                        />
                      </>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>아이디</strong> {member.memberId}
                    </li>
                    <li>
                      <strong>카카오아이디</strong>{" "}
                      {member.kakaoId ? "연동 가능" : "없음"}
                    </li>
                    <li>
                      <strong>닉네임</strong> {member.memberNickname}
                    </li>
                    <li>
                      <strong>전화번호</strong> {member.memberTel}
                    </li>
                    <li>
                      <strong>이메일</strong> {member.memberEmail}
                    </li>
                    <li className="member-standard-view">
                      <strong>회원유형</strong>
                      <div className="member-standard-labels">
                        <span className="main-type">{mainType || "일반"}</span>
                        {disabled && (
                          <span className="tag-disabled">장애인</span>
                        )}
                        {pregnant && (
                          <span className="tag-pregnant">임산부</span>
                        )}
                      </div>
                    </li>
                    <li>
                      <strong>가입일</strong> {member.enrollDate}
                    </li>
                    <li>
                      <strong>주소</strong>
                      <p>우편번호 : {zipcode}</p>
                      <p>주소 : {baseAddress}</p>
                      <p>상세주소 : {detailAddress}</p>
                    </li>
                    <li>
                      <strong>임시 주소</strong>
                      <p>우편번호 : {zipcode2 ? zipcode2 : "없음"}</p>
                      <p>주소 : {baseAddress2 ? baseAddress2 : "없음"}</p>
                      <p>
                        상세주소 : {detailAddress2 ? detailAddress2 : "없음"}
                      </p>
                    </li>
                  </>
                )}
              </ul>

              {editMode ? (
                <button onClick={saveMemberData}>저장</button>
              ) : (
                <button onClick={handleEdit}>수정</button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 혜택 리스트 */}
      <section className="benefit-list">
        <div style={{ position: "relative" }}>
          {loading && <LoadingOverlay />}
          <h3>혜택 목록 ({benefits.length})</h3>
          <div className="category-tabs">
            {loading && <LoadingOverlay />}
            {["시설", "채용", "혜택"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={category === cat ? "active" : ""}
              >
                {cat}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="benefit-cards"
            >
              {benefits.map((benefit) => {
                switch (category) {
                  case "채용":
                    return (
                      <div
                        className="benefit-card"
                        key={benefit.recruitNo}
                        onClick={() =>
                          navigate(`welfareService/detail/${benefit.serviceNo}`)
                        }
                      >
                        <div className="badge-row">채용 정보</div>
                        <div className="benefit-title">{benefit.jobTitle}</div>
                        <div className="benefit-agency">
                          {benefit.jobFacilityName}
                        </div>
                        <div className="benefit-salary">
                          입금조건: {benefit.jobSalary}
                        </div>
                        <div className="benefit-field">
                          채용분야: {benefit.jobPosition}
                        </div>
                        <div className="benefit-requirement">
                          자격조건: {benefit.jobRequirement}
                        </div>
                        <div className="benefit-description">
                          내용: {benefit.jobContent}
                        </div>
                        <p className="benefit-date">
                          {benefit.rcptbgndt && benefit.rcptenddt
                            ? `${benefit.rcptbgndt} ~ ${benefit.rcptenddt}`
                            : "상세 확인 필요"}
                        </p>
                      </div>
                    );

                  case "시설":
                    const isEvent = !!benefit.eventTitle; // 행사 여부

                    return (
                      <div className="benefit-card" key={benefit.facilityNo}>
                        <div className="badge-row">
                          {isEvent ? "이벤트 정보" : "시설 이용"}
                        </div>

                        <div className="benefit-title">
                          {isEvent ? benefit.eventTitle : benefit.facilityName}
                        </div>

                        <div className="benefit-kind">
                          {isEvent
                            ? benefit.eventContent
                            : benefit.facilityKindNM}
                        </div>

                        {!isEvent && (
                          <div className="benefit-requirement">
                            입장 기준: {benefit.requirement}
                          </div>
                        )}

                        <p className="benefit-date">
                          {isEvent
                            ? benefit.eventDateStart && benefit.eventDateEnd
                              ? `${benefit.eventDateStart} ~ ${benefit.eventDateEnd}`
                              : "상세 확인 필요"
                            : benefit.rcptbgndt && benefit.rcptenddt
                            ? `${benefit.rcptbgndt} ~ ${benefit.rcptenddt}`
                            : "상세 확인 필요"}
                        </p>
                      </div>
                    );

                  case "혜택":
                    return (
                      <div
                        className="benefit-card"
                        key={benefit.serviceNo}
                        onClick={() => handleClick(benefit)}
                      >
                        <div className="badge-row">
                          <span
                            className={`badge ${
                              benefit.receptionStart && benefit.receptionEnd
                                ? "신청혜택"
                                : "기본혜택"
                            }`}
                          >
                            {benefit.receptionStart && benefit.receptionEnd
                              ? "신청혜택"
                              : "기본혜택"}
                          </span>
                        </div>
                        <div className="benefit-title">
                          {benefit.serviceName}
                        </div>
                        <div className="benefit-agency">{benefit.agency}</div>
                        <div className="benefit-description">
                          {benefit.description}
                        </div>
                        <p className="benefit">
                          {benefit.receptionStart && benefit.receptionEnd
                            ? `${benefit.receptionStart} ~ ${benefit.receptionEnd}`
                            : "상세 확인 필요"}
                        </p>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 게시글 목록 */}
      <section className="post-list">
        <div style={{ position: "relative" }}>
          <div className="category-tabs">
            {loading && <LoadingOverlay />}
            {["게시글", "댓글"].map((cat) => (
              <button
                key={cat}
                onClick={() => setContentType(cat)}
                className={contentType === cat ? "active" : ""}
              >
                {cat}
              </button>
            ))}
          </div>
          {contentType === "게시글" && (
            <div>
              <h3>내가 작성한 게시글 ({board.length})</h3>
              <table className="post-table">
                <thead>
                  <tr>
                    <th>분류</th>
                    <th>해시태그</th>
                    <th>제목</th>
                    <th>내용</th>
                    <th>작성일</th>
                    <th>조회수</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((b) => (
                    <tr
                      key={b.boardNo}
                      className="clickable-row"
                      onClick={() => navigate(`/mytownBoard/${b.boardNo}`)}
                    >
                      <td>{b.postType}</td>
                      <td>{b.hashtags}</td>
                      <td>{b.boardTitle}</td>
                      <td>
                        {(() => {
                          const plainContent = stripHtml(b.boardContent);

                          if (!plainContent) return "내용 없음";

                          return plainContent.length > 20
                            ? `${plainContent.slice(0, 20)}...`
                            : plainContent;
                        })()}
                      </td>
                      <td>{b.boardDate}</td>
                      <td>{b.boardReadCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {contentType === "댓글" && (
            <div>
              <h3>내가 작성한 댓글 ({board.length})</h3>
              <table className="post-table">
                <thead>
                  <tr>
                    <th>분류</th>
                    <th>제목</th>
                    <th>내 댓글</th>
                    <th>작성일</th>
                    <th>좋아요</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((b) => (
                    <tr
                      key={b.commentNo}
                      onClick={() => navigate(`/mytownBoard/${b.boardNo}`)}
                    >
                      <td>{b.postType}</td>
                      <td>{b.boardTitle}</td>
                      <td>{b.commentContent}</td>
                      <td>{b.commentDate}</td>
                      <td>{b.likeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="post-list">
        <div style={{ position: "relative" }}>
          <div className="category-tabs">
            {loading && <LoadingOverlay />}
            {["게시글", "댓글"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCommentContentType(cat)}
                className={commentContentType === cat ? "active" : ""}
              >
                {cat}
              </button>
            ))}
          </div>
          {commentContentType === "게시글" && (
            <div>
              <h3>내가 좋아요를 누른 게시글 ({like.length})</h3>
              <table className="post-table">
                <thead>
                  <tr>
                    <th>분류</th>
                    <th>해시태그</th>
                    <th>제목</th>
                    <th>내용</th>
                    <th>작성자</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {like.map((l) => (
                    <tr key={l.boardNo}>
                      <td>{l.postType}</td>
                      <td>{l.hashtags}</td>
                      <td>{l.boardTitle}</td>
                      <td>
                        {l.boardContent
                          ? l.boardContent.length > 20
                            ? `${l.boardContent.slice(0, 20)}...`
                            : l.boardContent
                          : "내용 없음"}
                      </td>
                      <td>{l.memberNickname}</td>
                      <td>{l.boardDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {commentContentType === "댓글" && (
            <div>
              <h3>내가 좋아요를 누른 댓글 ({like.length})</h3>
              <table className="post-table">
                <thead>
                  <tr>
                    <th>분류</th>
                    <th>제목</th>
                    <th>내 댓글</th>
                    <th>작성일</th>
                    <th>좋아요</th>
                  </tr>
                </thead>
                <tbody>
                  {like.map((l) => (
                    <tr key={l.commentNo}>
                      <td>{l.postType}</td>
                      <td>{l.boardTitle}</td>
                      <td>{l.commentContent}</td>
                      <td>{l.commentDate}</td>
                      <td>{l.likeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
