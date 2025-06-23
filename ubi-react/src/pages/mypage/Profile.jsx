import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {

  const [benefits, setBenefits] = useState([]);
  const [posts, setPosts] = useState([]);
  const [member, setMember] = useState(null);

  // 내 기본 정보
  const getMemberData = async () => {
    try {
       console.log("axios 요청 시작");
      const res = await axios.get('/api/myPage/info');
     console.log("응답 받음:", res);
      console.log(res.data);

      if (res.status === 200) {
        setMember(res.data);
      }
    } catch (err) {
      console.error("기본정보 조회 중 예외 발생 : ", err);
    }
  };

  
  useEffect(() => {
    console.log("useEffect 실행");
    getMemberData();
    // 혜택 목록

    // 내가 작성한 게시글 목록
  }, []);

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
        <div className="benefit-cards">
          {benefits.map((benefit) => (
            <div className="benefit-card" key={benefit.id}>
              <div className="badge-row">
                {benefit.isNew && <span className="badge new">NEW</span>}
                {benefit.requiresApplication && <span className="badge 신청필요">신청필요</span>}
              </div>
              <div className="benefit-title">{benefit.title}</div>
              <div className="benefit-description">{benefit.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 게시글 목록 */}
      <section className="post-list">
        <h3>내가 작성한 게시글 ({posts.length})</h3>
        <table className="post-table">
          <thead>
            <tr>
              <th>분류</th>
              <th>게시판</th>
              <th>제목</th>
              <th>내용</th>
              <th>작성일</th>
              <th>작성자</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.category}</td>
                <td>{post.boardName}</td>
                <td>{post.title}</td>
                <td>{post.content}</td>
                <td>{post.createdDate}</td>
                <td>{post.writer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="post-list">
        <h3>내가 좋아요를 누른 게시글 ({posts.length})</h3>
        <table className="post-table">
          <thead>
            <tr>
              <th>분류</th>
              <th>게시판</th>
              <th>제목</th>
              <th>내용</th>
              <th>작성일</th>
              <th>작성자</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.category}</td>
                <td>{post.boardName}</td>
                <td>{post.title}</td>
                <td>{post.content}</td>
                <td>{post.createdDate}</td>
                <td>{post.writer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Profile;