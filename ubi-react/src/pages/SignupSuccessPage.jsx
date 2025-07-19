import { useNavigate } from "react-router-dom";
import styles from "../styles/Signup.module.css";

const SignupSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.mainBox}>
        <div className={styles.imageBox}>
          <img src="/default-thumbnail.png" alt="회원가입 환영 이미지" />
        </div>
        <div className={styles.completeBox}>
          <h3>환영합니다!</h3>
          <p>회원가입이 완료되었습니다.</p>
          <button onClick={() => navigate("/login")} className={styles.secondaryBtn}>
            로그인 하러 가기
          </button>
          <img src="/ubi.svg" alt="완료 캐릭터" className={styles.characterImage} />
        </div>
      </div>
    </div>
  );
};

export default SignupSuccessPage;