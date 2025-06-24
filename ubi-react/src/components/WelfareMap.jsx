import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { toLonLat } from "ol/proj";
import { Style, Stroke, Fill } from "ol/style";

import WelfareCompareView from "./WelfareCompareView";
import WelfareBenefitView from "./WelfareBenefitView";
import Spinner from "./Spinner";
import useBenefitStore from "../stores/useWelfareStore";
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";

const specialCityNames = {
  수원시: "수원특례시",
  용인시: "용인특례시",
  고양시: "고양특례시",
  창원시: "창원특례시",
  화성시: "화성시",
  성남시: "성남특례시",
  안양시: "안양시",
  안산시: "안산시",
  전주시: "전주시",
  천안시: "천안시",
  청주시: "청주시",
};

const extractCleanAddress = (rawAddress) => {
  if (!rawAddress) return "";
  return rawAddress.includes("^^^") ? rawAddress.split("^^^")[1] : rawAddress;
};

const mapCleanFullName = (fullName) => {
  const tokens = fullName.split(" ");
  if (tokens.length < 2) return fullName;
  const [sido, sigungu] = tokens;
  return `${sido} ${specialCityNames[sigungu] || sigungu}`;
};

const WelfareMap = () => {
  const mapElement = useRef();
  const mapRef = useRef();
  const districtBLayerRef = useRef(null);
  const { token, address } = useAuthStore();
  const districtA = token ? extractCleanAddress(address) : "서울특별시 종로구";
  const [districtB, setDistrictB] = useState(null);

  const { benefitsData, setBenefitsData } = useBenefitStore();
  const [isLoading, setIsLoading] = useState(!benefitsData);
  const { setRegion } = useSelectedRegionStore();

  // ✅ 복지 데이터 API 호출
  useEffect(() => {
    if (benefitsData) return;
    fetch("/api/welfare-curl/welfare-list/all")
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        const items = data?.servList;
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const fullName =
              item.ctpvNm === "세종특별자치시"
                ? "세종특별자치시"
                : item.sggNm
                ? `${item.ctpvNm} ${item.sggNm}`
                : item.ctpvNm;
            const clean = mapCleanFullName(fullName).trim();
            if (!grouped[clean]) grouped[clean] = [];
            grouped[clean].push(item);
          });
          setBenefitsData(grouped);
        }
      })
      .catch((err) => console.error("❌ 복지API 호출 실패:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // ✅ 지도 초기화
  useEffect(() => {
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://api.vworld.kr/req/wmts/1.0.0/6D96057A-FC81-30BE-B98E-39266237CBD1/Base/{z}/{y}/{x}.png",
            crossOrigin: "anonymous",
          }),
        }),
      ],
      view: new View({
        center: [14135362.197, 4518290.522],
        zoom: 7,
        minZoom: 6,
        maxZoom: 20,
      }),
    });

    mapRef.current = map;
    map.on("click", (evt) => {
      const [lon, lat] = toLonLat(evt.coordinate);
      reverseGeocode(lon, lat);
    });

    return () => map.setTarget(null);
  }, []);

  // ✅ 지도 클릭 시 역지오코딩
  const reverseGeocode = (lon, lat) => {
    fetch(`/api/welfare-curl/reverse-geocode?lon=${lon}&lat=${lat}`)
      .then((res) => res.json())
      .then((data) => {
        const structure = data?.response?.result?.[0]?.structure;
        if (!structure) return;

        setRegion(structure.level1, structure.level2);

        const fullName = `${structure.level1} ${structure.level2}`;
        const cleanFullName = mapCleanFullName(fullName);

        if (cleanFullName === districtA) return; // A와 같으면 무시
        displayBPolygon(cleanFullName);
      })
      .catch((err) => console.error("지오코딩 실패:", err));
  };
  // A 지역 폴리곤 표시
  const districtALayerRef = useRef(null); // A 지역 별도 레이어

  const displayAPolygon = (fullNameClean) => {
    fetch("/TL_SCCO_SIG_KDJ.json")
      .then((res) => res.json())
      .then((geojson) => {
        const features = geojson.features.filter(
          (f) => f.properties.FULL_NM_CLEAN?.trim() === fullNameClean.trim()
        );
        if (features.length === 0) return;

        if (districtALayerRef.current) {
          mapRef.current.removeLayer(districtALayerRef.current);
        }

        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(
            { type: "FeatureCollection", features },
            { featureProjection: "EPSG:3857" }
          ),
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            stroke: new Stroke({ color: "#dc3545", width: 3 }), // 빨간색 테두리
            fill: new Fill({ color: "rgba(220, 53, 69, 0.3)" }),
          }),
        });

        mapRef.current.addLayer(vectorLayer);
        districtALayerRef.current = vectorLayer;
      });
  };
  useEffect(() => {
    if (districtA && mapRef.current) {
      const cleanA = mapCleanFullName(districtA);
      displayAPolygon(cleanA);
    }
  }, [districtA]);

  // ✅ B 지역 폴리곤 표시
  const displayBPolygon = (fullNameClean) => {
    fetch("/TL_SCCO_SIG_KDJ.json")
      .then((res) => res.json())
      .then((geojson) => {
        const features = geojson.features.filter(
          (f) => f.properties.FULL_NM_CLEAN?.trim() === fullNameClean.trim()
        );
        if (features.length === 0) return;

        // 기존 B 지역 제거
        if (districtBLayerRef.current) {
          mapRef.current.removeLayer(districtBLayerRef.current);
        }

        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(
            { type: "FeatureCollection", features },
            { featureProjection: "EPSG:3857" }
          ),
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            stroke: new Stroke({ color: "#007bff", width: 3 }),
            fill: new Fill({ color: "rgba(0, 128, 255, 0.4)" }),
          }),
        });

        mapRef.current.addLayer(vectorLayer);
        districtBLayerRef.current = vectorLayer;
        setDistrictB(fullNameClean);
      });
  };

  return (
    <div>
      {isLoading && <Spinner />}
      <h2>복지 지도</h2>
      <div ref={mapElement} style={{ width: "100%", height: "600px" }}></div>

      <div style={{ marginTop: "10px" }}>
        <h3>기준 지역 (A): {districtA}</h3>
        {districtB && <h3>비교 지역 (B): {districtB}</h3>}
      </div>

      {!districtB && (
        <WelfareBenefitView
          district={districtA}
          benefits={benefitsData}
          isLoading={isLoading}
        />
      )}

      {districtA && districtB && (
        <WelfareCompareView
          districtA={districtA}
          districtB={districtB}
          benefits={benefitsData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default WelfareMap;
