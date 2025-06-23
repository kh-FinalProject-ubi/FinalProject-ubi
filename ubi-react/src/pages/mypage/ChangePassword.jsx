import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 비밀번호 유효성 검사 함수
  const isPasswordValid = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!currentPw || !newPw || !confirmPw) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    if (!isPasswordValid(newPw)) {
      setError('새 비밀번호는 영문과 숫자를 포함한 8자 이상이어야 합니다.');
      return;
    }

    if (newPw !== confirmPw) {
      setError('새 비밀번호가 확인 값과 일치하지 않습니다.');
      return;
    }

    setError(''); // 에러 초기화

    try {
      const response = await axios.post('/api/member/change-password', {
        currentPassword: currentPw,
        newPassword: newPw,
      });

      if (response.data.success) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      } else {
        setError(response.data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="change-password-container">
      <h2>비밀번호 변경</h2>
      <form onSubmit={handleChangePassword}>
        <div>
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            required
          />
        </div>
        <div>
          <label>새 비밀번호</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
          />
        </div>
        <div>
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
          />
        </div>
        <button type="submit">변경</button>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </form>
    </div>
  );
};

export default ChangePassword;
