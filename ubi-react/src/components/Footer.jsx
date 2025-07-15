import React from "react";
import styles from "../styles/Footer.module.css"; // CSS 모듈 import

const Footer = () => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.siteFooterInner}>
        <div className={styles.siteFooterColumn}>
          <strong>UBI @ kh academy</strong>
          <br />
          서울 동작구 남성로 120
          <br />
          02 - 1111 - 2222
        </div>
        <div className={styles.siteFooterColumn}>
          <div>프로젝트 소개 | 이용안내 | 개인정보처리방침 | 고객센터</div>
          <div>행정안전부, 복지로, 서울시 복지포털, WAS 등 연계</div>
        </div>
        <div className={styles.siteFooterColumn}>
          <div>한국사회보장정보원, 복지로 API 사용</div>
          <div>비상연락처, 운영시간 안내 등도 추가 가능</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
