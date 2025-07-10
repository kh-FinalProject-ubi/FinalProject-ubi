import React, { useState, useMemo, useEffect } from "react";
import useLocalBenefitData from "../../hook/welfareService/useLocalBenefitData";
import useAuthStore from "../../stores/useAuthStore";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import WelfareSearchFilter from "./WelfareSearchFilter";
import { applyAllFilters } from "../../utils/applyAllFilters";
import LikeButton from "../welfareLike/LikeButton";
import { useNavigate } from "react-router-dom";
import { extractRegionFromTaddress } from "../../utils/extractRegionFromTaddress";
import "../../styles/LocalBenefitSection.css";

const LocalBenefitSection = () => {
  const { data: benefits, loading, error } = useLocalBenefitData();
  const navigate = useNavigate();

  // ✅ 상태 가져오기
  const {
    token,
    memberStandard,
    regionCity,
    regionDistrict,
    tempRegionCity,
    tempRegionDistrict,
    taddress,
  } = useAuthStore((state) => state);

  // ✅ 최초 토큰/지역정보 세팅 이후 fetch를 실행하도록 의존성 배열에 넣기
  useEffect(() => {
    if (!tempRegionCity || !tempRegionDistrict) return;

    // 여기에 필터링 fetch 트리거 혹은 상태 업데이트 등 넣기
  }, [tempRegionCity, tempRegionDistrict]);

  // ✅ 선택된 주소 (지도 클릭 등)
  const selectedCity = useSelectedRegionStore((state) => state.selectedCity);
  const selectedDistrict = useSelectedRegionStore(
    (state) => state.selectedDistrict
  );

  // ✅ taddress 파싱 → 임시주소
  const parsedTempRegion = useMemo(() => {
    if (!taddress) return { city: null, district: null };
    return extractRegionFromTaddress(taddress);
  }, [taddress]);

  useEffect(() => {}, [
    parsedTempRegion,
    tempRegionCity,
    tempRegionDistrict,
    taddress,
  ]);

  // ✅ 주소 소스 탭 상태 (기본: 'token')
  const [addressSource, setAddressSource] = useState("token"); // "token" | "selected" | "temp"

  // ✅ 실제 적용될 주소 계산
  const region = useMemo(() => {
    if (!token) return { city: "서울특별시", district: "종로구" };

    switch (addressSource) {
      case "selected":
        return {
          city: selectedCity ?? regionCity,
          district: selectedDistrict ?? regionDistrict,
        };
      case "temp":
        return {
          city: tempRegionCity,
          district: tempRegionDistrict,
        };
      case "token":
      default:
        return { city: regionCity, district: regionDistrict };
    }
  }, [
    addressSource,
    token,
    regionCity,
    regionDistrict,
    selectedCity,
    selectedDistrict,
    tempRegionCity,
    tempRegionDistrict,
  ]);

  // ✅ 필터 상태
  const [filterOptions, setFilterOptions] = useState({
    keyword: "",
    serviceType: "전체",
    category: "전체",
    sortOrder: "latest",
    showAll: false,
  });

  const authState = {
    token,
    memberStandard,
    regionCity: region.city,
    regionDistrict: region.district,
  };

  // ✅ 필터 적용
  const filteredData = Array.isArray(benefits)
    ? applyAllFilters(benefits, filterOptions, authState)
    : [];

  return (
    <section className="local-benefit-section">
      <h2 className="section-title">🎁 지역 복지 혜택 모음</h2>

      {/* 🔘 주소 소스 선택 탭 */}
      {!token ? null : (
        <div className="address-tab">
          <button
            className={addressSource === "token" ? "selected" : ""}
            onClick={() => setAddressSource("token")}
          >
            내 주소
          </button>

          <button
            className={addressSource === "selected" ? "selected" : ""}
            onClick={() => setAddressSource("selected")}
          >
            선택한 주소
          </button>

          {tempRegionCity && tempRegionDistrict && (
            <button
              className={addressSource === "temp" ? "selected" : ""}
              onClick={() => setAddressSource("temp")}
            >
              임시 주소
            </button>
          )}
        </div>
      )}

      {/* 🔎 필터 UI */}
      <WelfareSearchFilter
        onFilterChange={setFilterOptions}
        fixedRegion={region}
        disabledRegionSelect={!!token}
      />

      {loading && <p>로딩 중...</p>}
      {error && <p>데이터를 불러오는 데 실패했습니다.</p>}

      <div className="benefit-grid">
        {filteredData.length > 0
          ? filteredData.map((item) => (
              <div
                className="benefit-card"
                key={item.id || item.title}
                onClick={() =>
                  navigate("/welfareService/detail", { state: { data: item } })
                }
              >
                <div className="card-header">
                  <h3>{item.title}</h3>
                  <span className="category">{item.category}</span>
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="복지 이미지"
                    className="thumbnail"
                  />
                )}
                <p className="region">{item.region}</p>
                <p className="description">
                  {item.description?.slice(0, 80)}...
                </p>
                <div
                  className="card-footer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LikeButton
                    token={token}
                    apiServiceId={item.apiServiceId}
                    serviceName={item.title}
                    category={item.category}
                    regionCity={item.regionCity}
                    regionDistrict={item.regionDistrict}
                    description={item.description}
                    agency={item.agency}
                    url={item.url}
                    receptionStart={item.receptionStart}
                    receptionEnd={item.receptionEnd}
                    imageProfile={item.imageProfile}
                    lat={item.lat}
                    lng={item.lng}
                  />
                </div>
              </div>
            ))
          : !loading && <p>조건에 맞는 복지 혜택이 없습니다.</p>}
      </div>
    </section>
  );
};

export default LocalBenefitSection;
