import axios from "axios";

export const login = (input) =>
  axios.post("http://localhost:80/api/member/login", input, {
    withCredentials: true // ✅ 여기에 있어야 세션 쿠키가 백엔드로 전송됨
  });