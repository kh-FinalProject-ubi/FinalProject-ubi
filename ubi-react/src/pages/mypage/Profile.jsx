import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/mypage/Profile.module.css";
import useAuthStore from "../../stores/useAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import LoadingOverlay from "../../components/Loading";
import ProfileImgUploader from "./ProfileImgUploader";
import { div } from "framer-motion/client";
import DaumPostcode from "react-daum-postcode";
import { stripHtml } from "./striptHtml";
import Pagination from "../../components/Pagination";
import BenefitCardGeneral from "../../components/MyPage/BenefitCardGeneral";
import BenefitCardWrapper from "../../components/MyPage/BenefitCardWrapper";

const parseMemberStandardCode = (code) => {
  switch (code) {
    case "A":
      return { main: "일반", isDisabled: false, isPregnant: true };
    case "B":
      return { main: "노인", isDisabled: true, isPregnant: true };
    case "C":
      return { main: "청년", isDisabled: true, isPregnant: true };
    case "D":
      return { main: "아동", isDisabled: true, isPregnant: true };

    case "E":
      return { main: "노인", isDisabled: false, isPregnant: true };
    case "F":
      return { main: "청년", isDisabled: false, isPregnant: true };
    case "G":
      return { main: "아동", isDisabled: false, isPregnant: true };

    case "H":
      return { main: "일반", isDisabled: true, isPregnant: false };
    case "I":
      return { main: "노인", isDisabled: true, isPregnant: false };
    case "J":
      return { main: "청년", isDisabled: true, isPregnant: false };
    case "K":
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
  const [category, setCategory] = useState("혜택"); // or '채용', '혜택', '시설'

  const [board, setBoard] = useState([]);
  const [contentType, setContentType] = useState("게시글"); // or '댓글'

  const [like, setlike] = useState([]);
  const [commentContentType, setCommentContentType] = useState("게시글"); // or '댓글'

  const [benefitPage, setBenefitPage] = useState(1);
  const PER_PAGE_BENEFIT = 4;

  const [postPage, setPostPage] = useState(1);
  const PER_PAGE_POST = 5;

  const [likePage, setLikePage] = useState(1);
  const PER_PAGE_LIKE = 5;

  const [favorites, setFavorites] = useState(new Set());
  const mappedBenefits = benefits.map((b) => ({
    ...b,
    isFav: favorites.has(b.serviceNo),
  }));
  const totalBenefitPages = Math.ceil(mappedBenefits.length / PER_PAGE_BENEFIT);
  const pagedBenefits = mappedBenefits.slice(
    (benefitPage - 1) * PER_PAGE_BENEFIT,
    benefitPage * PER_PAGE_BENEFIT
  );

  const totalPostPages = Math.ceil(board.length / PER_PAGE_POST);
  const pagedBoard = board.slice(
    (postPage - 1) * PER_PAGE_POST,
    postPage * PER_PAGE_POST
  );

  const totalLikePages = Math.ceil(like.length / PER_PAGE_LIKE);
  const pagedLike = like.slice(
    (likePage - 1) * PER_PAGE_LIKE,
    likePage * PER_PAGE_LIKE
  );

  useEffect(() => {
    setBenefitPage(1);
  }, [category]);
  useEffect(() => {
    setPostPage(1);
  }, [contentType, board.length]);
  useEffect(() => {
    setLikePage(1);
  }, [commentContentType, like.length]);

  /* contentType 이 바뀌면 1페이지부터 */
  useEffect(() => {
    setBenefitPage(1);
  }, [contentType]);

  useEffect(() => {
    setPostPage(1);
  }, [contentType]);

  useEffect(() => {
    setLikePage(1);
  }, [contentType]);

  const handleUnfav = (id) => {
    setBenefits((prev) =>
      prev.filter((b) =>
        b.serviceNo
          ? b.serviceNo !== id
          : b.recruitNo
          ? b.recruitNo !== id
          : b.facilityNo !== id
      )
    );
  };

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
      const res = await axios.get("/api/myPage/info", {
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
        authority: member.authority,
        memberAddress: fullAddress,
        memberTaddress: fullAddress2,
        memberStandard: code,
      };

      console.log("저장 payload:", payload);

      const res = await axios.post("/api/myPage/update", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ JWT가 함께 반환되었는지 확인하고 localStorage 갱신
      const newToken = res.data.token;
      if (newToken) {
        localStorage.setItem(
          "auth-storage",
          JSON.stringify({ state: { token: newToken } })
        );
        console.log("✅ 토큰 갱신 완료");
      }

      // 저장 성공 확인
      if (res.status === 200) {
        alert("수정되었습니다.");
        await getMemberData(); // ⬅️ 최신 데이터 다시 가져오기
        setEditMode(false);

        navigate("/facility/search", { state: { refresh: "memberUpdate" } });
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
      console.log("작성글 axios 요청 시작");
      const res = await axios.get("/api/myPage/board", {
        params: { memberNo: memberNo, contentType: contentType },
      });
      // console.log("작성글 응답 받음:", res);
      console.log("작성글 응답 값:", res.data);

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
    console.log("카드 클릭!", benefit);
    // 1. 시설 카테고리는 facilityNo 등으로만 상세 이동
    if (category === "시설") {
      // 복지시설 상세로 이동: facility 객체 state로 넘김 (네 상세페이지 구조 기준)
      console.log("시설 상세페이지 이동!", benefit);
      navigate("/facility/detail", { state: { facility: benefit } });
      return;
    }

    // 2. 혜택/채용/이벤트 등은 apiServiceId 기반 분기
    const { apiServiceId } = benefit;
    if (!apiServiceId) {
      alert("상세 데이터 식별자가 없습니다.");
      return;
    }

    if (apiServiceId.startsWith("bokjiro-")) {
      const servId = apiServiceId.replace("bokjiro-", "");
      navigate("/welfarefacility/detail", { state: { facility: benefit } });
    } else if (apiServiceId.startsWith("seoul-")) {
      navigate(`/seoulDetail?apiServiceId=${apiServiceId}`, {
        state: { data: benefit },
      });
    } else if (apiServiceId.startsWith("job-API")) {
      const servId = apiServiceId.replace(/^job-API[12]-/, "");
      navigate(`/facilityJobDetail?servId=${servId}`, {
        state: { data: benefit },
      });
    } else {
      alert("지원하지 않는 상세 데이터 유형입니다.");
    }
  };

  return (
    <div className={styles.mypageProfile}>
      <h2>내 정보</h2>

      {member && (
        <section className={styles.basicInfo}>
          <div style={{ position: "relative" }}>
            {loading}
            <div className={styles.basicInfoHeader}>
              <h3>기본 정보</h3>
              <div className={styles.categoryTabs}>
                {editMode ? (
                  <button calssName={styles.save} onClick={saveMemberData}>
                    저장
                  </button>
                ) : (
                  <button calssName={styles.edit} onClick={handleEdit}>
                    수정
                  </button>
                )}
              </div>
            </div>
            <div className={styles.line} />
            <div className={styles.profileRow}>
              <div className={styles.profileLeft}>
                <ProfileImgUploader member={member} onSave={onProfileSave} />
              </div>
              <div className={styles.profileRight}>
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
                        <p>{member.kakaoId ? "카카오 연동됨" : null}</p>
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
                            setMember({
                              ...member,
                              memberEmail: e.target.value,
                            })
                          }
                        />
                      </li>
                      <li>
                        <strong>회원 유형</strong>
                        <div className={styles.radioGroup}>
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

                        <div className={styles.checkboxGroup}>
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
                        <input type="text" value={member.enrollDate} readOnly />
                      </li>

                      {/* 내 주소 */}
                      <li className={styles.addressRow}>
                        <strong>내 주소</strong>

                        <div className={styles.addressInputsColumn}>
                          <div className={styles.inputRow}>
                            <button
                              type="button"
                              className={styles.postcodeBtn}
                              onClick={() => openPostcodePopup("main")}
                            >
                              우편번호 검색
                            </button>
                            <input
                              value={zipcode}
                              readOnly
                              className={styles.postcodeInput}
                              placeholder="우편번호"
                            />
                          </div>

                          <input
                            value={baseAddress}
                            readOnly
                            className={styles.baseAddrInput}
                            placeholder="기본 주소"
                          />

                          <input
                            ref={detailAddressRef}
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            className={styles.detailAddrInput}
                            placeholder="상세 주소"
                          />
                        </div>
                      </li>

                      {/* 임시 주소 */}
                      <li className={styles.addressRow}>
                        <strong>임시 주소</strong>

                        <div className={styles.addressInputsColumn}>
                          <div className={styles.inputRow}>
                            <button
                              type="button"
                              className={styles.postcodeBtn}
                              onClick={() => openPostcodePopup("temp")}
                            >
                              우편번호 검색
                            </button>
                            <input
                              value={zipcode2}
                              readOnly
                              className={styles.postcodeInput}
                              placeholder="우편번호"
                            />
                          </div>

                          <input
                            value={baseAddress2}
                            readOnly
                            className={styles.baseAddrInput}
                            placeholder="기본 주소"
                          />

                          <input
                            ref={detailAddressRef}
                            value={detailAddress2}
                            onChange={(e) => setDetailAddress2(e.target.value)}
                            className={styles.detailAddrInput}
                            placeholder="상세 주소"
                          />
                        </div>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>아이디</strong> {member.memberId}
                        <p className={styles.kako}>
                          {member.kakaoId
                            ? "카카오 연동됨 : " + member.kakaoId
                            : null}
                        </p>
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
                      <li className={styles.memberStandardView}>
                        <strong>회원유형</strong>
                        <div className={styles.memberStandardLbels}>
                          <span className={styles.memberType}>
                            {mainType || "일반"}
                          </span>
                          {disabled && (
                            <span className={styles.tagDisabled}>장애인</span>
                          )}
                          {pregnant && (
                            <span className={styles.tagPregnant}>임산부</span>
                          )}
                        </div>
                      </li>
                      <li>
                        <strong>가입일</strong> {member.enrollDate}
                      </li>
                      <li className={styles.address}>
                        <div className={styles.addressHeader}>
                          <strong>내 주소</strong>
                          <div className={styles.addressBody}>
                            <p className={styles.zipcode}>{`[${zipcode}]`}</p>
                            <p>
                              {baseAddress} , {detailAddress}
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className={styles.address}>
                        <div className={styles.addressHeader}>
                          <strong>임시 주소</strong>
                          <div className={styles.addressBody}>
                            <p className={styles.zipcode}>{`[${
                              zipcode2 ? zipcode2 : "없음"
                            }]`}</p>
                            <p>
                              {baseAddress2 ? baseAddress2 : "없음"} ,
                              {detailAddress2 ? detailAddress2 : "없음"}
                            </p>
                          </div>
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 혜택 리스트 */}
      <section className={styles.benefitList}>
        <div style={{ position: "relative" }}>
          {loading}
          {/* ⬇️ 헤더 : 제목 + 카테고리 토글 */}
          <div className={styles.listHeader}>
            <h3>찜 목록 ({benefits.length})</h3>
            <div className={styles.categoryTabs}>
              {["혜택", "시설"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={category === cat ? styles.active : ""}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.line} />

          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className={styles.benefitCards}
            >
              {benefits.length === 0 ? (
                <p className={styles.emptyMsg}>
                  {category === "혜택" && "찜한 혜택이 없습니다."}
                  {category === "시설" && "찜한 시설이 없습니다."}
                </p>
              ) : (
                pagedBenefits.map((benefit) => {
                  console.log("💡 카드로 전달되는 benefit:", benefit);
                  return (
                    <BenefitCardWrapper
                      key={
                        benefit.serviceNo ||
                        benefit.recruitNo ||
                        benefit.facilityNo
                      }
                      category={category}
                      benefit={benefit}
                      token={token}
                      onUnfav={handleUnfav}
                      onClick={handleClick}
                    />
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>

          {/* ⬇️ 페이지네이션 – 필요하면 로직 연결 */}
          {totalBenefitPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={benefitPage}
                totalPages={totalBenefitPages}
                onPageChange={setBenefitPage}
              />
            </div>
          )}
        </div>
      </section>

      {/* 게시글 목록 */}
      <section className={styles.postList}>
        <div style={{ position: "relative" }}>
          {loading}
          <div className={styles.listHeader}>
            <h3>
              {contentType === "게시글"
                ? `내가 작성한 게시글 (${board.length})`
                : `내가 작성한 댓글 (${board.length})`}
            </h3>

            <div className={styles.categoryTabs}>
              {["게시글", "댓글"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setContentType(cat)}
                  className={contentType === cat ? styles.active : ""}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.line} />

          {contentType === "게시글" && (
            <div>
              {loading ? (
                <div className={styles.loadingPlaceholder}>불러오는 중...</div>
              ) : pagedBoard.length === 0 ? (
                <p className={styles.emptyMsg}>작성한 게시글이 없습니다.</p>
              ) : (
                <table className={styles.postTable}>
                  <thead>
                    <tr>
                      <th>분류</th>
                      <th>해시태그</th>
                      <th className={styles.content}>제목</th>
                      <th className={styles.content}>내용</th>
                      <th>작성일</th>
                      <th>조회수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBoard.map((b) => (
                      <tr
                        key={b.boardNo}
                        className={styles.clickableRow}
                        onClick={() => navigate(`/mytownBoard/${b.boardNo}`)}
                      >
                        <td>{b.postType}</td>
                        <td>
                          {(() => {
                            if (!b.hashtags) {
                              return (
                                <span
                                  className={`${styles.hashtag} ${styles.hashtagNone}`}
                                >
                                  없음
                                </span>
                              );
                            }

                            const first = b.hashtags.split(",")[0].trim();
                            const text =
                              first.length > 3
                                ? `#${first.slice(0, 3)}...`
                                : `#${first}`;

                            return (
                              <span className={styles.hashtag}>{text}</span>
                            );
                          })()}
                        </td>
                        <td className={styles.content}>
                          {(() => {
                            const plainContent = stripHtml(b.boardTitle);

                            if (!plainContent) return "내용 없음";

                            return plainContent.length > 15
                              ? `${plainContent.slice(0, 15)}...`
                              : plainContent;
                          })()}
                        </td>
                        <td className={styles.content}>
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
              )}
            </div>
          )}

          {contentType === "댓글" && (
            <div>
              {loading ? (
                <div className={styles.loadingPlaceholder}>불러오는 중...</div>
              ) : pagedBoard.length === 0 ? (
                <p className={styles.emptyMsg}>작성한 댓글이 없습니다.</p>
              ) : (
                <table className={styles.postTable}>
                  <thead>
                    <tr>
                      <th>분류</th>
                      <th className={styles.content}>제목</th>
                      <th className={styles.content}>내 댓글</th>
                      <th>작성일</th>
                      <th>좋아요</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBoard.map((b) => (
                      <tr
                        key={b.commentNo}
                        className={styles.clickableRow}
                        onClick={() => navigate(`/mytownBoard/${b.boardNo}`)}
                      >
                        <td>{b.postType}</td>
                        <td className={styles.content}>
                          {(() => {
                            const plainContent = stripHtml(b.boardTitle);

                            if (!plainContent) return "내용 없음";

                            return plainContent.length > 15
                              ? `${plainContent.slice(0, 15)}...`
                              : plainContent;
                          })()}
                        </td>
                        <td className={styles.content}>
                          {(() => {
                            const plainContent = stripHtml(b.commentContent);

                            if (!plainContent) return "내용 없음";

                            return plainContent.length > 20
                              ? `${plainContent.slice(0, 20)}...`
                              : plainContent;
                          })()}
                        </td>
                        <td>{b.commentDate}</td>
                        <td>{b.likeCount != null ? b.likeCount : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ⬇️ 페이지네이션 – 필요하면 로직 연결 */}
          {totalPostPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={postPage}
                totalPages={totalPostPages}
                onPageChange={setPostPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
