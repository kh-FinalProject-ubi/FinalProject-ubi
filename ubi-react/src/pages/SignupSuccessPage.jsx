import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/common/SignupSuccessPage.module.css";

const SignupSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // state가 존재하면 이름을, 없으면 기본 텍스트를 사용합니다.
  const name = location.state?.name;

  return (
    <div className={styles.container}>
      <div className={styles.mainBox}>
        {/* 이미지 경로는 실제 프로젝트에 맞게 수정해주세요. */}
        <div className={styles.imageBox}>
          <img src="/default-thumbnail.png" alt="회원가입 환영 이미지" />
        </div>
        <div className={styles.completeBox}>
          {/* 이름이 존재할 경우에만 이름을 포함한 메시지를 보여줍니다. */}
          <h3>{name ? `${name}님, ` : ""}환영합니다!</h3>
          <p>회원가입이 완료되었습니다.</p>
          <button onClick={() => navigate("/login")} className={styles.loginButton}>
            로그인 하러 가기
          </button>
          {/* 캐릭터 이미지 경로는 실제 프로젝트에 맞게 수정해주세요. */}
          <img src="/ubi.svg" alt="완료 캐릭터" className={styles.characterImage} />
        </div>
      </div>
    </div>
  );
};

export default SignupSuccessPage;