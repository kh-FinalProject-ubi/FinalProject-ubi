import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import "../../styles/mypage/Profile.css";
import useAuthStore from '../../stores/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingOverlay from '../../components/Loading';
import { div } from 'framer-motion/client';
import DaumPostcode from "react-daum-postcode";

const Profile = () => {
  
  const { memberNo } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  const { token } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  const [loading, setLoading] = useState(false);

  const [member, setMember] = useState(null);
  const [zipcode, setZipcode] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const detailAddressRef = useRef(null);

  const [benefits, setBenefits] = useState([]);
  const [category, setCategory] = useState('시설'); // or '채용', '혜택', '시설'

  const [board, setBoard] = useState([]);
  const [contentType, setContentType] = useState('게시글'); // or '댓글'
  
  const [like, setlike] = useState([]);
  const [commentContentType, setCommentContentType] = useState('게시글'); // or '댓글'

  // 로딩
  const withLoading = async (taskFn) => {
    setLoading(true);
    try {
      await taskFn();  // 단일 작업 실행
    } catch (e) {
      console.error("로딩 중 에러", e);
    } finally {
      setLoading(false);
    }
  };
  
  // 내 기본 정보
  const getMemberData = async () => {
    try {
      // console.log("기본정보 axios 요청 시작");
      const res = await axios.get('/api/myPage/info', { params: {memberNo : memberNo} });
      console.log("기본정보 응답 받음:", res);
      // console.log("기본정보 응답 값:", res.data);
      
      if (res.status === 200) {
        setMember(res.data);
      }
    } catch (err) {
      console.error("기본정보 조회 중 예외 발생 : ", err);
    }
  };

  // 내 정보 수정
  const saveMemberData = async () => {
    try {
      // 주소 합치기
      const fullAddress = `${zipcode}^^^${baseAddress}^^^${detailAddress}`;

      const payload = {
        ...member,
        memberNo: memberNo,
        memberAddress : fullAddress
      };

      await axios.post("/api/myPage/update", { member : payload });
      alert("수정되었습니다.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("수정에 실패했습니다.");
    }
  };
  
  // 혜택 목록
  const getBenefitsData = async () => {
    try{
      // console.log("혜택 axios 요청 시작");
      const res = await axios.get('/api/myPage/service', { params: {memberNo : memberNo, category: category} });
      console.log("혜택 응답 받음:", res);
      // console.log("혜택 응답 값:", res.data);

      if (res.status === 200) {
        setBenefits(res.data);
      }

    }catch(err) {
      console.error("혜택목록 조회 중 예외 발생 : ", err)
    }
  }
  
  // 내가 작성한 게시글/댓글 목록
  const getBoardData = async () => {
    try{
      // console.log("작성글 axios 요청 시작");
      const res = await axios.get('/api/myPage/board', { params: {memberNo : memberNo, contentType : contentType} });
      console.log("작성글 응답 받음:", res);
      // console.log("작성글 응답 값:", res.data);

      if (res.status === 200) {
        setBoard(res.data);
      }

    }catch(err) {
      console.error("작성글 목록 조회 중 예외 발생 : ", err)
    }
  }

  // 내가 좋아요를 누른 게시글 목록
  const getLikeData = async () => {
    try{
      // console.log("좋아요 axios 요청 시작");
      const res = await axios.get('/api/myPage/like', { params: {memberNo : memberNo, contentType : commentContentType} });
      console.log("좋아요 응답 받음:", res);
      // console.log("좋아요 응답 값:", res.data);

      if (res.status === 200) {
        setlike(res.data);
      }

    }catch(err) {
      console.error("좋아요 목록 조회 중 예외 발생 : ", err)
    }
  }

  const fetchData = async () => {
    await withLoading(async () => {
      await getMemberData();      // 멤버 상태 저장
      await getBenefitsData();    // 혜택
      await getBoardData();       // 게시글 or 댓글
      await getLikeData();        // 좋아요
    });
  };

  // 주소 분리
  useEffect(() => {
    if (member?.memberAddress) {
      const [zip, base, detail] = member.memberAddress.split("^^^");
      setZipcode(zip);
      setBaseAddress(base);
      setDetailAddress(detail);
      console.log("주소 분리됨:", zip, base, detail);
    }
  }, [member]);

  const handleComplete = (data) => {
  let fullAddress = data.address;
  let extraAddress = "";

  if (data.addressType === "R") {
    if (data.bname !== "") {
      extraAddress += data.bname;
    }
    if (data.buildingName !== "") {
      extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
    }
    if (extraAddress !== "") {
      fullAddress += ` (${extraAddress})`;
    }
  }

  setZipcode(data.zonecode);
  setBaseAddress(fullAddress);
  setIsPopupOpen(false);

  if (detailAddressRef.current) {
    detailAddressRef.current.focus();
  }
};

  useEffect(() => {
    if (!memberNo) return;
    console.log("useEffect 실행");
    fetchData();

  }, [memberNo, category, contentType, commentContentType]);

  return (
    <div className="mypage-profile">
      <h2>내 정보</h2>

      {member && (
        <section className="basic-info">
          <div style={{ position: 'relative' }}>
            {loading && <LoadingOverlay />}
            <h3>기본 정보</h3>
            <div className="profile-left">
              <img
                src={member.profileImg || "/assets/profile-example.png"}
                alt="프로필"
                className="profile-img"
              />
            </div>
            <div className="profile-right">
              <ul>
                {editMode ? (
                  <>
                    <li>
                      <strong>닉네임</strong>
                      <input
                        type="text"
                        value={member.memberNickname}
                        onChange={(e) =>
                          setMember({ ...member, memberNickname: e.target.value })
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
                      <strong>주소</strong>
                        <>
                          <div style={{ marginBottom: '8px' }}>
                            <button type="button" onClick={() => setIsPopupOpen(true)}>
                              우편번호 검색
                            </button>
                          </div>

                          <input
                            value={zipcode}
                            placeholder="우편번호"
                            readOnly
                            style={{ backgroundColor: '#f1f1f1', cursor: 'default' }}
                          />

                          <input
                            value={baseAddress}
                            placeholder="기본 주소"
                            readOnly
                            style={{ backgroundColor: '#f1f1f1', cursor: 'default' }}
                          />

                          <input
                            ref={detailAddressRef}
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            placeholder="상세 주소"
                          />

                          {isPopupOpen && (
                            <div style={{ position: "relative", zIndex: 1000 }}>
                              <DaumPostcode
                                onComplete={handleComplete}
                                autoClose
                                style={{ position: "absolute" }}
                              />
                              <button
                                type="button"
                                onClick={() => setIsPopupOpen(false)}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  zIndex: 1001
                                }}
                              >
                                닫기
                              </button>
                            </div>
                          )}
                        </>
                    </li>
                  </>
                ) : (
                  <>
                    <li><strong>닉네임</strong> {member.memberNickname}</li>
                    <li><strong>전화번호</strong> {member.memberTel}</li>
                    <li><strong>이메일</strong> {member.memberEmail}</li>
                    <li><strong>주소</strong> 
                    <p>우편번호 : {zipcode}</p>
                    <p>주소 : {baseAddress}</p>
                    <p>상세주소 : {detailAddress}</p>
                    </li>
                  </>
                )}
              </ul>

              {editMode ? (
                <button onClick={saveMemberData}>저장</button>
              ) : (
                <button onClick={() => setEditMode(true)}>수정</button>
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
            {['시설', '채용', '혜택'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={category === cat ? 'active' : ''}
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
                    case '채용':
                      return (
                        <div className="benefit-card" key={benefit.recruitNo}>
                          <div className="badge-row">채용 정보</div>
                          <div className="benefit-title">{benefit.jobTitle}</div>
                          <div className="benefit-agency">{benefit.jobFacilityName}</div>
                          <div className="benefit-salary">입금조건: {benefit.jobSalary}</div>
                          <div className="benefit-field">채용분야: {benefit.jobPosition}</div>
                          <div className="benefit-requirement">자격조건: {benefit.jobRequirement}</div>
                          <div className="benefit-description">내용: {benefit.jobContent}</div>
                          <p className="benefit-date">
                            {benefit.rcptbgndt && benefit.rcptenddt
                              ? `${benefit.rcptbgndt} ~ ${benefit.rcptenddt}`
                              : '상세 확인 필요'}
                          </p>
                        </div>
                      );

                    case '시설':
                      const isEvent = !!benefit.eventTitle; // 행사 여부

                      return (
                        <div className="benefit-card" key={benefit.facilityNo}>
                          <div className="badge-row">{isEvent ? '이벤트 정보' : '시설 이용'}</div>

                          <div className="benefit-title">
                            {isEvent ? benefit.eventTitle : benefit.facilityName}
                          </div>

                          <div className="benefit-kind">
                            {isEvent ? benefit.eventContent : benefit.facilityKindNM}
                          </div>

                          {!isEvent && (
                            <div className="benefit-requirement">입장 기준: {benefit.requirement}</div>
                          )}

                          <p className="benefit-date">
                            {isEvent
                              ? benefit.eventDateStart && benefit.eventDateEnd
                                ? `${benefit.eventDateStart} ~ ${benefit.eventDateEnd}`
                                : '상세 확인 필요'
                              : benefit.rcptbgndt && benefit.rcptenddt
                              ? `${benefit.rcptbgndt} ~ ${benefit.rcptenddt}`
                              : '상세 확인 필요'}
                          </p>
                        </div>)

                    case '혜택':
                      return (
                        <div className="benefit-card" key={benefit.serviceNo}>
                          <div className="badge-row">
                            <span className={`badge ${
                              benefit.receptionStart && benefit.receptionEnd ? '신청혜택' : '기본혜택'
                            }`}>
                              {benefit.receptionStart && benefit.receptionEnd ? '신청혜택' : '기본혜택'}
                            </span>
                          </div>
                          <div className="benefit-title">{benefit.serviceName}</div>
                          <div className="benefit-agency">{benefit.agency}</div>
                          <div className="benefit-description">{benefit.description}</div>
                          <p className="benefit">
                            {benefit.receptionStart && benefit.receptionEnd
                              ? `${benefit.receptionStart} ~ ${benefit.receptionEnd}`
                              : '상세 확인 필요'}
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
            {['게시글', '댓글'].map(cat => (
              <button
                key={cat}
                onClick={() => setContentType(cat)}
                className={contentType === cat ? 'active' : ''}
              >
                {cat}
              </button>
            ))}
          </div>
          {contentType === '게시글' && (
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
                    <tr key={b.boardNo}>
                      <td>{b.postType}</td>
                      <td>{b.hashtags}</td>
                      <td>{b.boardTitle}</td>
                      <td>
                        {b.boardContent
                          ? b.boardContent.length > 20
                            ? `${b.boardContent.slice(0, 20)}...`
                            : b.boardContent
                          : "내용 없음"}
                      </td>
                      <td>{b.boardDate}</td>
                      <td>{b.boardReadCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {contentType === '댓글' && (
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
                    <tr key={b.commentNo}>
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
            {['게시글', '댓글'].map(cat => (
              <button
                key={cat}
                onClick={() => setCommentContentType(cat)}
                className={commentContentType === cat ? 'active' : ''}
              >
                {cat}
              </button>
            ))}
          </div>
          {commentContentType === '게시글' && (
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

          {commentContentType === '댓글' && (
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