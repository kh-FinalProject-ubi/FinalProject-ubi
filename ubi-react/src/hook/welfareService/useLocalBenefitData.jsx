import { useEffect, useState } from "react";
import axios from "axios";

/**
 * 통합 복지 혜택 데이터 가져오는 커스텀 훅
 * SeoulWelfare + YouthPolicy + FacilityJob + Bokjiro
 */
export default function useLocalBenefitData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [seoulRes, youthRes, jobRes, bokjiroRes] = await Promise.all([
          axios.get("/api/services"),
          axios.get("/api/welfare-curl/youth-policy", {
            params: { pageNum: 1, pageSize: 100 },
          }),
          axios.get("/api/facilityjob"),
          axios.get("/api/welfare-curl/welfare-list/all"),
        ]);

        const seoul = Array.isArray(seoulRes.data)
          ? seoulRes.data.map((item, index) => ({
              id: `seoul-${item.apiServiceId || index}`,
              title: decodeHTML(item.serviceName ?? "제목 없음"),
              description: extractText(item.description ?? ""),
              category: "서울시 복지",
              startDate: item.receptionStart ?? "-",
              endDate: item.receptionEnd ?? "-",
              region: item.regionDistrict ?? "지역 정보 없음",
              imageUrl: item.imageProfile ?? null,
              link: item.url ?? null,
            }))
          : [];

        const youth = Array.isArray(youthRes.data?.result?.youthPolicyList)
          ? youthRes.data.result.youthPolicyList.map((item, index) => ({
              id: `youth-${item.plcyNo || index}`,
              title: item.plcyNm ?? "제목 없음",
              description: item.plcyExplnCn ?? "설명 없음",
              category: "청년 정책",
              startDate: item.rceptStartDate ?? "-",
              endDate: item.rceptEndDate ?? "-",
              region: item.pblancAdres ?? "지역 정보 없음",
              imageUrl: null,
              link: item.pblancUrl ?? null,
            }))
          : [];

        const jobs = Array.isArray(jobRes.data)
          ? jobRes.data.map((item, i) => ({
              id: `job-${item.apiSource}-${i}`,
              title: item.jobTitle ?? "구인 공고",
              description: item.jobRequirement ?? "내용 없음",
              category: "복지시설 구인",
              startDate: item.jobStartDate ?? "-",
              endDate: item.jobEndDate ?? "-",
              region: `${item.regionCity} ${item.regionDistrict}`.trim(),
              imageUrl: null,
              link: item.apiSourceUrl ?? null,
            }))
          : [];

        const bokjiro = Array.isArray(bokjiroRes.data?.servList)
          ? bokjiroRes.data.servList.map((item, idx) => ({
              id: `bokjiro-${item.servId || idx}`,
              title: item.servNm ?? "복지 서비스",
              description: item.servDgst ?? "설명 없음",
              category: "복지로",
              startDate: "정보 없음",
              endDate: item.lastModYmd ?? "-",
              region: `${item.ctpvNm ?? ""} ${item.sggNm ?? ""}`.trim(),
              imageUrl: null,
              link: item.servDtlLink ?? null,
            }))
          : [];

        setData([...seoul, ...youth, ...jobs, ...bokjiro]);
      } catch (err) {
        console.error("❌ useLocalBenefitData error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { data, loading, error };
}

// HTML 디코더
function decodeHTML(html) {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// HWP JSON 설명 추출
function extractText(raw) {
  try {
    const decodedHtml = decodeHTML(raw);
    const match = decodedHtml.match(/<!--\[data-hwpjson\]({[\s\S]*?})-->/);
    if (!match) return decodedHtml;

    const hwpJson = JSON.parse(match[1]);
    const result = [];

    if (Array.isArray(hwpJson.ru)) {
      for (const block of hwpJson.ru) {
        if (Array.isArray(block.ch)) {
          for (const chunk of block.ch) {
            if (chunk.t && chunk.t.trim()) result.push(chunk.t.trim());
          }
        }
      }
    }

    return result.join(" ").slice(0, 100) + "...";
  } catch {
    return "내용 없음";
  }
}
