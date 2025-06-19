import React, { useEffect, useState } from "react";
import axios from "axios";

// HWP 기반 자료가 JSON으로 포함된 경우 수정
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const extractTextFromHwpJson = (raw) => {
  try {
    // ① HTML 엔터티 먼저 디코딩
    const decodedHtml = decodeHTML(raw);

    // ② JSON 블록을 추출 (<!--[data-hwpjson]{...}--> 형태)
    const match = decodedHtml.match(/<!--\[data-hwpjson\]({[\s\S]*?})-->/);
    if (!match) return decodedHtml; // JSON 없으면 그냥 디코딩된 본문 리턴

    // ③ JSON 부분만 파싱
    const hwpJson = JSON.parse(match[1]);
    const result = [];

    // ru 배열 내 'ch' 안의 't' 필드만 추출
    if (hwpJson.ru && Array.isArray(hwpJson.ru)) {
      hwpJson.ru.forEach((block) => {
        if (block.ch && Array.isArray(block.ch)) {
          block.ch.forEach((chunk) => {
            if (chunk.t && chunk.t.trim()) {
              result.push(chunk.t.trim());
            }
          });
        }
      });
    }

    return result.join("\n");
  } catch (e) {
    console.error(e);
    return "상세내용 파싱 불가";
  }
};

const SeoulWelfare = () => {
  const [services, setServices] = useState([]);
  // 주석달기

  useEffect(() => {
    axios
      .get("http://localhost:80/api/services")
      .then((response) => {
        setServices(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("데이터 불러오기 실패:", error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">공공서비스 목록</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">서비스명</th>
            <th className="p-2 border">사용조건</th>
            <th className="p-2 border">시작시간</th>
            <th className="p-2 border">종료시간</th>
            <th className="p-2 border">url</th>
            <th className="p-2 border">이미지 프로필</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item) => (
            <tr key={item.apiServiceId} className="border-b">
              <td className="p-2 border">{decodeHTML(item.SVCNM)}</td>
              <td className="p-2 border">{decodeHTML(item.USETGTINFO)}</td>
              <td className="p-2 border">{decodeHTML(item.RCPTBGNDT)}</td>
              <td className="p-2 border">{decodeHTML(item.RCPTENDDT)}</td>
              <td className="p-2 border whitespace-pre-wrap">
                {extractTextFromHwpJson(item.DTLCONT)}
              </td>
              <td className="p-2 border">
                <a
                  href={decodeHTML(item.SVCURL)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  바로가기
                </a>
              </td>
              <td className="p-2 border">
                <img
                  src={decodeHTML(item.IMGURL)}
                  alt="서비스 이미지"
                  className="w-20 h-auto"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeoulWelfare;
