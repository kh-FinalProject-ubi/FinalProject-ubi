// API 호출 모듈
// 왜 services/boardApi.js를 따로 만드는가?

// -재사용성	여러 컴포넌트에서 같은 API를 사용할 때 중복 없이 import만 하면 됨
// -가독성 향상	API 관련 로직을 UI 코드에서 분리하니 컴포넌트가 깔끔해짐
// -유지보수 편리	API URL이 변경되면 해당 파일만 수정하면 됨
// -기능 확장 용이	인증, 에러 처리, 로딩 처리 등 API 전용 로직을 추가하기 쉬움

import axios from 'axios';

const API_BASE = '/api/board';

axios.defaults.withCredentials = true;

export const fetchLocalBoardList = async () => {
  const res = await axios.get(`${API_BASE}/mytownBoard`, { withCredentials: true });
  return res.data;
};