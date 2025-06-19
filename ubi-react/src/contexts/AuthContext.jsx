import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// 외부에서 사용 가능하도록 훅으로 export
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // 로그인 처리
  const login = (userData) => {
    setIsLogin(true);
    setUserInfo(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // 로그아웃 처리
  const logout = () => {
    setIsLogin(false);
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  // 새로고침 시 로그인 유지
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setIsLogin(true);
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLogin, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
