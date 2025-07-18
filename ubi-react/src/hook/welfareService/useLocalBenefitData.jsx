import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import useBenefitStore from "../../stores/useWelfareStore";
import { normalizeRegion } from "../../utils/regionUtils";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
}

export default function useLocalBenefitData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { benefitsData, lastFetchedAt, setBenefitsData } = useBenefitStore();
  const { memberStandard, showAll } = useAuthStore.getState();

  const isStale = () => {
    if (!lastFetchedAt) return true;
    const last = new Date(lastFetchedAt);
    const now = new Date();
    const diffInHours = (now - last) / (1000 * 60 * 60);
    return diffInHours > 24;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        let token = localStorage.getItem("token");
        let payload = null;

        if (token) {
          try {
            payload = JSON.parse(atob(token.split(".")[1]));
            console.log("🧪 payload.taddress:", payload?.taddress);
          } catch (e) {
            console.warn("⚠️ JWT 디코딩 실패:", e);
          }
        }

        const responses = await Promise.allSettled([
          axios.get("/api/services"), // 서울시
          axios.get("/api/welfare-curl/youth-policy", {
            params: { pageNum: 1, pageSize: 100 },
          }),
          axios.get("/api/facilityjob"), // 복지시설 일자리
          axios.get("/api/welfare-curl/welfare-list/all"), // 복지로
        ]);

        const [seoulRes, youthRes, jobRes, bokjiroRes] = responses;

        const seoul =
          seoulRes.status === "fulfilled" && Array.isArray(seoulRes.value.data)
            ? seoulRes.value.data.map((item, index) => {
                const regionCity = "서울특별시";
                const regionDistrict = item.AREANM ?? "지역 정보 없음";
                const apiServiceId = `seoul-${item.SVCID || index}`;
                return {
                  id: apiServiceId,
                  apiServiceId,
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
                  source: "seoul",
                };
              })
            : [];

        const youth =
          youthRes.status === "fulfilled" &&
          Array.isArray(youthRes.value.data?.result?.youthPolicyList)
            ? youthRes.value.data.result.youthPolicyList
                .filter(() => memberStandard === "청년" || showAll)
                .map((item, index) => {
                  const apiServiceId = `youth-${item.plcyNo || index}`;
                  return {
                    id: apiServiceId,
                    apiServiceId,
                    title: item.plcyNm ?? "제목 없음",
                    description: item.plcyExplnCn ?? "설명 없음",
                    category: "청년 정책",
                    startDate: item.rceptStartDate ?? "-",
                    endDate: item.rceptEndDate ?? "-",
                    region: item.pblancAdres ?? "지역 정보 없음",
                    regionCity: "",
                    regionDistrict: "",
                    imageUrl: null,
                    link: item.pblancUrl ?? null,
                    source: "youth",
                  };
                })
            : [];

        const jobs =
          jobRes.status === "fulfilled" && Array.isArray(jobRes.value.data)
            ? jobRes.value.data.map((item, i) => {
                const { regionCity, regionDistrict, region } = normalizeRegion(
                  item.ctpvNm,
                  item.sggNm
                );
                const apiServiceId = `job-${item.apiSource}-${i}`;
                return {
                  id: apiServiceId,
                  apiServiceId,
                  title: item.jobTitle ?? "구인 공고",
                  description: item.jobRequirement ?? "내용 없음",
                  category: "복지시설 구인",
                  startDate: item.jobStartDate ?? "-",
                  endDate: item.jobEndDate ?? "-",
                  region,
                  regionCity,
                  regionDistrict,
                  imageUrl: null,
                  link: item.apiSourceUrl ?? null,
                  source: "job",
                };
              })
            : [];

        const bokjiro =
          bokjiroRes.status === "fulfilled" &&
          Array.isArray(bokjiroRes.value.data?.servList)
            ? bokjiroRes.value.data.servList.map((item, idx) => {
                const { regionCity, regionDistrict, region } = normalizeRegion(
                  item.ctpvNm,
                  item.sggNm
                );
                const apiServiceId = item.servId || `bokjiro-${idx}`;
                return {
                  id: apiServiceId,
                  apiServiceId,
                  title: item.servNm ?? "복지 서비스",
                  description: item.servDgst ?? "설명 없음",
                  category: "지자체복지혜택",
                  startDate: "정보 없음",
                  endDate: item.lastModYmd ?? "-",
                  region,
                  regionCity,
                  regionDistrict,
                  imageUrl: null,
                  link: item.servDtlLink ?? null,
                  source: "bokjiro",
                  servId: item.servId || null,
                };
              })
            : [];

        const all = [...seoul, ...youth, ...jobs, ...bokjiro];
        console.log("🎯 전체 복지 데이터 수:", all.length);
        setBenefitsData(all);
      } catch (err) {
        console.error("❌ useLocalBenefitData error (전역 catch):", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (!benefitsData || isStale()) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [memberStandard, showAll]);

  return {
    data: Array.isArray(benefitsData) ? benefitsData : [],
    loading,
    error,
  };
}
