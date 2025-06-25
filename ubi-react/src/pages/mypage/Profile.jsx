import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../styles/mypage/Profile.css";
import useAuthStore from '../../stores/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';

const Profile = () => {
  
  const { memberNo } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  console.log('memberNo:', memberNo);

  const [member, setMember] = useState(null);

  const [benefits, setBenefits] = useState([]);
  const [category, setCategory] = useState('시설'); // or '채용', '혜택', '시설'

  const [board, setboard] = useState([]);
  const [contentType, setContentType] = useState('게시글'); // or '댓글'

  const [like, setlike] = useState([]);

  // 내 기본 정보
  const getMemberData = async () => {
    try {
       console.log("기본정보 axios 요청 시작");
      const res = await axios.get('/api/myPage/info', { params: {memberNo : memberNo} });
     console.log("기본정보 응답 받음:", res);
      console.log("기본정보 응답 값:", res.data);

      if (res.status === 200) {
        setMember(res.data);
      }
    } catch (err) {
      console.error("기본정보 조회 중 예외 발생 : ", err);
    }
  };

  // 혜택 목록
  const getBenefitsData = async () => {
    try{
      console.log("혜택 axios 요청 시작");
      const res = await axios.get('/api/myPage/service', { params: {memberNo : memberNo, category: category} });
      console.log("혜택 응답 받음:", res);
      console.log("혜택 응답 값:", res.data);

      if (res.status === 200) {
        setBenefits(res.data);
      }

    }catch(err) {
      console.error("혜택목록 조회 중 예외 발생 : ", err)
    }
  }
  
  // 내가 작성한 게시글 목록
  const getBoardData = async () => {
    try{
      console.log("작성글 axios 요청 시작");
      const res = await axios.get('/api/myPage/board', { params: {memberNo : memberNo} });
      console.log("작성글 응답 받음:", res);
      console.log("작성글 응답 값:", res.data);

      if (res.status === 200) {
        setboard(res.data);
      }

    }catch(err) {
      console.error("작성글 목록 조회 중 예외 발생 : ", err)
    }
  }

  // 내가 좋아요를 누른 게시글 목록
  const getLikeData = async () => {
    try{
      console.log("좋아요 axios 요청 시작");
      const res = await axios.get('/api/myPage/like', { params: {memberNo : memberNo} });
      console.log("좋아요 응답 받음:", res);
      console.log("좋아요 응답 값:", res.data);

      if (res.status === 200) {
        setlike(res.data);
      }

    }catch(err) {
      console.error("좋아요 목록 조회 중 예외 발생 : ", err)
    }
  }

  useEffect(() => {
    if (!memberNo) return;
    console.log("useEffect 실행");
    getMemberData();
    getBenefitsData();
    getBoardData();
    getLikeData();

  }, [memberNo]);

    return (
    <div className="mypage-profile">
      <h2>내 정보</h2>

      {member && (
        <section className="basic-info">
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
              <li><strong>닉네임</strong> {member.memberNickname}</li>
              <li><strong>아이디</strong> {member.memberId}</li>
              <li><strong>이름</strong> {member.memberName}</li>
              <li><strong>전화번호</strong> {member.memberTel}</li>
              <li><strong>이메일</strong> {member.memberEmail}</li>
              <li><strong>주소</strong> {member.memberAddress}</li>
            </ul>
          </div>
        </section>
      )}

      {/* 혜택 리스트 */}
      <section className="benefit-list">
        <h3>혜택 목록 ({benefits.length})</h3>
        <div className="category-tabs">
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
                      <div className="benefit-card" key={benefit.facilityId}>
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
      </section>

      {/* 게시글 목록 */}
      <section className="post-list">
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
            {board.map((board) => (
              <tr key={board.boardNo}>
                <td>{board.postType}</td>
                <td>{board.hashtags}</td>
                <td>{board.boardTitle}</td>
                <td>
                  {board.boardContent
                    ? board.boardContent.length > 20
                      ? `${board.boardContent.slice(0, 20)}...`
                      : board.boardContent
                    : "내용 없음"}
                </td>
                <td>{board.boardDate}</td>
                <td>{board.boardReadCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="post-list">
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
            {like.map((like) => (
              <tr key={like.id}>
                <td>{like.postType}</td>
                <td>{like.hashtag}</td>
                <td>{like.boardTitle}</td>
                <td>{like.boardContent}</td>
                <td>{like.memberNickname}</td>
                <td>{like.boardDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Profile;