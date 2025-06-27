import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

// hook 내부에서 상태 가져오기
const memberStandard = useAuthStore.getState().memberStandard;
const showAll = useAuthStore.getState().showAll; // 또는 filterOptions.showAll에서 가져오는 방식으로

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
}

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
        console.log("📦 seoulRes.data", seoulRes.data);

        const seoul = Array.isArray(seoulRes.data)
          ? seoulRes.data.map((item, index) => {
              const regionCity = "서울특별시";
              const regionDistrict = item.AREANM ?? "지역 정보 없음";

              return {
                id: `seoul-${item.SVCID || index}`,
                title: item.SVCNM ?? "제목 없음",
                description: item.DTLCONT ?? "설명 없음",
                category: "서울시 복지",
                startDate: formatDate(item.SVCOPNBGNDT),
                endDate: formatDate(item.SVCOPNENDDT),
                region: `${regionCity} ${regionDistrict}`,
                regionCity,
                regionDistrict,
                imageUrl: item.IMGURL ?? null,
                link: item.V_URL ?? null,
              };
            })
          : [];

        // 필터 조건 반영
        const youth = Array.isArray(youthRes.data?.result?.youthPolicyList)
          ? youthRes.data.result.youthPolicyList
              .filter(() => memberStandard === "청년" || showAll) // ✅ 조건 추가
              .map((item, index) => ({
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
          ? jobRes.data.map((item, i) => {
              const regionCity = item.regionCity ?? "";
              const regionDistrict = item.regionDistrict ?? "";
              return {
                id: `job-${item.apiSource}-${i}`,
                title: item.jobTitle ?? "구인 공고",
                description: item.jobRequirement ?? "내용 없음",
                category: "복지시설 구인",
                startDate: item.jobStartDate ?? "-",
                endDate: item.jobEndDate ?? "-",
                region: `${regionCity} ${regionDistrict}`.trim(),
                regionCity,
                regionDistrict,
                imageUrl: null,
                link: item.apiSourceUrl ?? null,
              };
            })
          : [];

        const bokjiro = Array.isArray(bokjiroRes.data?.servList)
          ? bokjiroRes.data.servList.map((item, idx) => ({
              id: `bokjiro-${item.servId || idx}`,
              title: item.servNm ?? "복지 서비스",
              description: item.servDgst ?? "설명 없음",
              category: "지자체복지혜택",
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
