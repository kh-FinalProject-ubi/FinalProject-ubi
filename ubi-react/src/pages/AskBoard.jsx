import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AskBoard = () => {
  return (
    <>
      <Header />
      <div style={{ padding: "2rem" }}>
        <h2>문의 게시판</h2>
        <p>궁금한 점이나 서비스 관련 문의사항을 자유롭게 남겨주세요.</p>
      </div>
      <Footer />
    </>
  );
};

export default AskBoard;
