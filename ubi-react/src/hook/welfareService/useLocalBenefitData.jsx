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
  const memberStandard = useAuthStore.getState().memberStandard;
  const showAll = useAuthStore.getState().showAll;

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

        const [seoulRes, youthRes, jobRes, bokjiroRes] = await Promise.all([
          axios.get("/api/services"),
          axios.get("/api/welfare-curl/youth-policy", {
            params: { pageNum: 1, pageSize: 100 },
          }),
          axios.get("/api/facilityjob"),
          axios.get("/api/welfare-curl/welfare-list/all"),
        ]);

        const seoul = Array.isArray(seoulRes.data)
          ? seoulRes.data.map((item, index) => {
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

        const youth = Array.isArray(youthRes.data?.result?.youthPolicyList)
          ? youthRes.data.result.youthPolicyList
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

        const jobs = Array.isArray(jobRes.data)
          ? jobRes.data.map((item, i) => {
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

        const bokjiro = Array.isArray(bokjiroRes.data?.servList)
          ? bokjiroRes.data.servList.map((item, idx) => {
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
        setBenefitsData(all);
      } catch (err) {
        console.error("❌ useLocalBenefitData error:", err);
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
  }, [benefitsData, memberStandard]);

  return {
    data: Array.isArray(benefitsData) ? benefitsData : [],
    loading,
    error,
  };
}
