import { useState } from "react";
import axios from "axios";
import "../../styles/mypage/ChangePassword.css";

const ChangePassword = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [validity, setValidity] = useState({
    currentPw: { error: '', success: '' },
    newPw: { error: '', success: '' },
    confirmPw: { error: '', success: '' },
  });

  const isPasswordValid = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  // ✅ 현재 비밀번호 핸들러
  const handleCurrentPwChange = (e) => {
    const val = e.target.value;
    setCurrentPw(val);

    setValidity(prev => ({
      ...prev,
      currentPw: isPasswordValid(val)
        ? { error: '', success: '사용 가능한 비밀번호입니다.' }
        : { error: '영문과 숫자를 포함한 8자 이상이어야 합니다.', success: '' }
    }));
  };

  // ✅ 새 비밀번호 핸들러
  const handleNewPwChange = (e) => {
    const val = e.target.value;
    setNewPw(val);

    const isValid = isPasswordValid(val);
    const match = confirmPw && val === confirmPw;

    setValidity(prev => ({
      ...prev,
      newPw: isValid
        ? { error: '', success: '사용 가능한 비밀번호입니다.' }
        : { error: '영문과 숫자를 포함한 8자 이상이어야 합니다.', success: '' },
      confirmPw: match
        ? { error: '', success: '비밀번호가 일치합니다.' }
        : confirmPw
          ? { error: '비밀번호가 일치하지 않습니다.', success: '' }
          : prev.confirmPw
    }));
  };

  // ✅ 새 비밀번호 확인 핸들러
  const handleConfirmPwChange = (e) => {
    const val = e.target.value;
    setConfirmPw(val);

    setValidity(prev => ({
      ...prev,
      confirmPw:
        newPw === val
          ? { error: '', success: '비밀번호가 일치합니다.' }
          : { error: '비밀번호가 일치하지 않습니다.', success: '' }
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 에러 있는지 체크
    if (
      validity.currentPw.error ||
      validity.newPw.error ||
      validity.confirmPw.error
    ) {
      setError('입력값을 확인해주세요.');
      return;
    }

    try {
      const res = await axios.post('/api/member/change-password', {
        currentPassword: currentPw,
        newPassword: newPw,
      });

      if (res.data.success) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        setValidity({
          currentPw: { error: '', success: '' },
          newPw: { error: '', success: '' },
          confirmPw: { error: '', success: '' },
        });
      } else {
        setError(res.data.message || '비밀번호 변경 실패');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="change-password-container">
      <h2>비밀번호 변경</h2>
      <form onSubmit={handleChangePassword}>
        {/* 현재 비밀번호 */}
        <div>
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={currentPw}
            onChange={handleCurrentPwChange}
            required
          />
          {validity.currentPw.error && <p className="error-message">{validity.currentPw.error}</p>}
          {!validity.currentPw.error && validity.currentPw.success && (
            <p className="success-message">{validity.currentPw.success}</p>
          )}
        </div>

        {/* 새 비밀번호 */}
        <div>
          <label>새 비밀번호</label>
          <input
            type="password"
            value={newPw}
            onChange={handleNewPwChange}
            required
          />
          {validity.newPw.error && <p className="error-message">{validity.newPw.error}</p>}
          {!validity.newPw.error && validity.newPw.success && (
            <p className="success-message">{validity.newPw.success}</p>
          )}
        </div>

        {/* 새 비밀번호 확인 */}
        <div>
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPw}
            onChange={handleConfirmPwChange}
            required
          />
          {validity.confirmPw.error && <p className="error-message">{validity.confirmPw.error}</p>}
          {!validity.confirmPw.error && validity.confirmPw.success && (
            <p className="success-message">{validity.confirmPw.success}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            validity.currentPw.error ||
            validity.newPw.error ||
            validity.confirmPw.error
          }
        >
          변경
        </button>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </form>
    </div>
  );
};

export default ChangePassword;
