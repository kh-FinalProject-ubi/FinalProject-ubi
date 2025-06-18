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
import WelfareCompareView from "./components/WelfareCompareView";
import WelfareBenefitView from "./components/WelfareBenefitView";

// ✅ 특례시 매핑 (정규화용)
const specialCityNames = {
  수원시: "수원특례시",
  용인시: "용인특례시",
  성남시: "성남특례시",
  고양시: "고양특례시",
  창원시: "창원특례시",
  안양시: "안양시",
  안산시: "안산시",
  전주시: "전주시",
  천안시: "천안시",
  청주시: "청주시",
};

// ✅ 행정구역 이름 정규화 함수
const mapCleanFullName = (fullName) => {
  const tokens = fullName.split(" ");
  if (tokens.length < 2) return fullName;
  const [sido, sigungu] = tokens;
  return `${sido} ${specialCityNames[sigungu] || sigungu}`;
};

const WelfareMap = () => {
  const mapElement = useRef();
  const mapRef = useRef();
  const selectedLayersRef = useRef([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const selectedDistrictsRef = useRef([]);
  const [benefitsData, setBenefitsData] = useState({});

  // ✅ 복지데이터 API 호출 → 지자체 기준 그룹화
  const groupByDistrict = (items) => {
    const grouped = {};
    items.forEach((item) => {
      let fullName;
      if (item.ctpvNm === "세종특별자치시") {
        fullName = "세종특별자치시"; // ✅ 세종 예외 처리
      } else {
        fullName = item.sggNm ? `${item.ctpvNm} ${item.sggNm}` : item.ctpvNm;
      }

      const cleanFullName = mapCleanFullName(fullName).trim();
      console.log("📌 복지 데이터 지역 키 생성됨:", cleanFullName);
      if (!grouped[cleanFullName]) grouped[cleanFullName] = [];
      grouped[cleanFullName].push(item);
    });
    console.log("📦 최종 benefitsData keys:", Object.keys(grouped));

    return grouped;
  };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/welfare-curl/welfare-list/all")
      .then((res) => res.json())
      .then((data) => {
        const items = data?.servList;
        if (Array.isArray(items)) {
          const groupedData = groupByDistrict(items);
          setBenefitsData(groupedData);
        }
      })
      .catch((err) => console.error("❌ 복지API 호출 실패:", err))
      .finally(() => setIsLoading(false)); // ✅ 로딩 완료
  }, []);

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
      const lonLat = toLonLat(evt.coordinate);
      reverseGeocode(lonLat[0], lonLat[1]);
    });

    return () => map.setTarget(null);
  }, []);

  useEffect(() => {
    selectedDistrictsRef.current = selectedDistricts;
  }, [selectedDistricts]);

  const reverseGeocode = (lon, lat) => {
    fetch(`/api/welfare-curl/reverse-geocode?lon=${lon}&lat=${lat}`)
      .then((res) => res.json())
      .then((data) => {
        const structure = data?.response?.result?.[0]?.structure;
        if (!structure) return;

        const fullName = `${structure.level1} ${structure.level2}`;
        const cleanFullName = mapCleanFullName(fullName);

        if (selectedDistrictsRef.current.includes(cleanFullName)) return;

        displayPolygon(cleanFullName);
      })
      .catch((err) => console.error("지오코딩 실패:", err));
  };

  const displayPolygon = (fullNameClean) => {
    fetch("/TL_SCCO_SIG_KDJ.json")
      .then((res) => res.json())
      .then((geojson) => {
        const features = geojson.features.filter(
          (f) => f.properties.FULL_NM_CLEAN?.trim() === fullNameClean.trim()
        );

        if (features.length === 0) return;

        const currentIndex =
          selectedLayersRef.current.length >= 2
            ? 1
            : selectedLayersRef.current.length;

        const colors = [
          { fill: "rgba(255, 0, 0, 0.4)", stroke: "#ff0000" },
          { fill: "rgba(0, 128, 255, 0.4)", stroke: "#007bff" },
        ];
        const color = colors[currentIndex];

        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(
            { type: "FeatureCollection", features },
            { featureProjection: "EPSG:3857" }
          ),
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            stroke: new Stroke({ color: color.stroke, width: 3 }),
            fill: new Fill({ color: color.fill }),
          }),
        });

        if (selectedLayersRef.current.length >= 2) {
          const removed = selectedLayersRef.current.shift();
          mapRef.current.removeLayer(removed);
          setSelectedDistricts((prev) => prev.slice(1));
        }

        mapRef.current.addLayer(vectorLayer);
        selectedLayersRef.current.push(vectorLayer);
        setSelectedDistricts((prev) => [...prev, fullNameClean]);
      });
  };
  return (
    <div>
      <h2>복지 지도</h2>
      <div ref={mapElement} style={{ width: "100%", height: "600px" }}></div>
      <div style={{ marginTop: "10px" }}>
        {isLoading ? (
          <p>복지 데이터를 불러오는 중입니다...</p>
        ) : (
          <>
            <h3>선택한 지자체:</h3>
            <ul>
              {selectedDistricts.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {selectedDistricts.length === 1 && (
        <WelfareBenefitView
          district={selectedDistricts[0]}
          benefits={benefitsData}
          isLoading={isLoading}
        />
      )}
      {selectedDistricts.length === 2 && (
        <WelfareCompareView
          districtA={selectedDistricts[0]}
          districtB={selectedDistricts[1]}
          benefits={benefitsData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default WelfareMap;
