import React, { useEffect, useRef, useState, useMemo } from "react";
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
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useLocalBenefitData from "../hook/welfareService/useLocalBenefitData";
import { normalizeSido, normalizeSigungu } from "../utils/regionUtils";

import styles from "../styles/WelfareMap.module.css";

const mapCleanFullName = (fullName) => {
  const tokens = fullName.split(" ");
  if (tokens.length < 2) return fullName;
  const [sido, sigungu] = tokens;
  return `${normalizeSido(sido)} ${normalizeSigungu(sigungu)}`.trim();
};

const extractCleanAddress = (rawAddress) =>
  rawAddress?.includes("^^^") ? rawAddress.split("^^^")[1] : rawAddress || "";

const WelfareMap = () => {
  const mapElement = useRef();
  const mapRef = useRef(null);
  const districtALayerRef = useRef(null);
  const districtBLayerRef = useRef(null);

  const { token, address } = useAuthStore();
  const { setRegion } = useSelectedRegionStore();
  const { data: allBenefits, loading } = useLocalBenefitData();

  const districtARaw = token
    ? extractCleanAddress(address)
    : "서울특별시 종로구";
  const normalizedDistrictA = useMemo(
    () => mapCleanFullName(districtARaw),
    [districtARaw]
  );
  const [districtB, setDistrictB] = useState(null);

  const groupedData = useMemo(() => {
    const result = {};
    allBenefits
      .filter((item) => item.category === "지자체복지혜택")
      .forEach((item) => {
        const clean = mapCleanFullName(
          `${item.regionCity} ${item.regionDistrict}`
        );
        if (!result[clean]) result[clean] = [];
        result[clean].push(item);
      });
    return result;
  }, [allBenefits]);

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
    map.on("click", ({ coordinate }) => {
      const [lon, lat] = toLonLat(coordinate);
      reverseGeocode(lon, lat);
    });

    return () => map.setTarget(null);
  }, []);

  const reverseGeocode = (lon, lat) => {
    fetch(`/api/welfare-curl/reverse-geocode?lon=${lon}&lat=${lat}`)
      .then((res) => res.json())
      .then(({ response }) => {
        const structure = response?.result?.[0]?.structure;
        if (!structure) return;

        setRegion(structure.level1, structure.level2);
        const cleanFull = mapCleanFullName(
          `${structure.level1} ${structure.level2}`
        );
        if (cleanFull === normalizedDistrictA) return;
        displayBPolygon(cleanFull);
      })
      .catch((err) => console.error("❌ 지오코딩 실패:", err));
  };

  const displayPolygon = (fullNameClean, color, layerRef) => {
    fetch("/TL_SCCO_SIG_KDJ.json")
      .then((res) => res.json())
      .then((geojson) => {
        const feat = geojson.features.filter(
          (f) => f.properties.FULL_NM_CLEAN?.trim() === fullNameClean.trim()
        );
        if (feat.length === 0) return;

        if (layerRef.current) mapRef.current.removeLayer(layerRef.current);

        const vectorLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(
              { type: "FeatureCollection", features: feat },
              { featureProjection: "EPSG:3857" }
            ),
          }),
          style: new Style({
            stroke: new Stroke({ color, width: 3 }),
            fill: new Fill({
              color:
                color === "#dc3545"
                  ? "rgba(220,53,69,0.3)"
                  : "rgba(0,123,255,0.4)",
            }),
          }),
        });

        mapRef.current.addLayer(vectorLayer);
        layerRef.current = vectorLayer;
      });
  };

  useEffect(() => {
    if (mapRef.current)
      displayPolygon(normalizedDistrictA, "#dc3545", districtALayerRef);
  }, [normalizedDistrictA]);

  const displayBPolygon = (cleanFull) => {
    displayPolygon(cleanFull, "#007bff", districtBLayerRef);
    setDistrictB(cleanFull);
  };

  return (
    <div>
      <div className={styles.mapWrapper}>
        <div ref={mapElement} className={styles.mapCanvas} />
        <aside className={styles.benefitPanel}>
          <div className={styles.tab}>지역</div>
          <div className={styles.content}>
            <div className={styles.compareText}>
              기준 지역 (A): {normalizedDistrictA}
            </div>
            {districtB && (
              <div className={styles.compareText}>
                비교 지역 (B): {districtB}
              </div>
            )}
            {districtB ? (
              <WelfareCompareView
                districtA={normalizedDistrictA}
                districtB={districtB}
                benefits={groupedData}
                isLoading={loading}
              />
            ) : (
              <WelfareBenefitView
                district={normalizedDistrictA}
                benefits={groupedData[normalizedDistrictA] ?? []}
                isLoading={loading}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WelfareMap;
