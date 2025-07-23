import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import CrimeLegend from "./CrimeLegend";
import styles from "../styles/CrimeSafetyMap.module.css";

// 🌍 배경 지도 URL 설정
const baseMapUrls = {
  satellite:
    "https://api.vworld.kr/req/wmts/1.0.0/3E730203-99F6-3B7E-8DED-879E725F5801/Satellite/{z}/{y}/{x}.jpeg",
  hybrid:
    "https://api.vworld.kr/req/wmts/1.0.0/3E730203-99F6-3B7E-8DED-879E725F5801/Hybrid/{z}/{y}/{x}.png",
};

// 🔍 범죄 유형 WMS 설정
const layerConfig = {
  전체: {
    layername: "A2SM_CRMNLHSPOT_F1_TOT",
    styles: "A2SM_OdblrCrmnlHspot_Tot_20_24",
  },
  성폭력: {
    layername: "A2SM_CRMNLHSPOT_F1_RAPE",
    styles: "A2SM_OdblrCrmnlHspot_Rape_20_24",
  },
  폭력: {
    layername: "A2SM_CRMNLHSPOT_F1_VIOLN",
    styles: "A2SM_OdblrCrmnlHspot_Violn_20_24",
  },
  절도: {
    layername: "A2SM_CRMNLHSPOT_F1_THEFT",
    styles: "A2SM_OdblrCrmnlHspot_Theft_20_24",
  },
  강도: {
    layername: "A2SM_CRMNLHSPOT_F1_BRGLR",
    styles: "A2SM_OdblrCrmnlHspot_Brglr_20_24",
  },
};

const CrimeSafetyMap = ({
  showHybrid,
  setShowHybrid,
  selectedCrime,
  setSelectedCrime,
}) => {
  const mapRef = useRef(null);
  const wmsLayerRef = useRef(null);
  const hybridLayerRef = useRef(null);

  // const [selectedCrime, setSelectedCrime] = useState("전체");
  // const [showHybrid, setShowHybrid] = useState(true); // ✅ 지명 토글 상태

  // 🗺️ 지도 초기화
  useEffect(() => {
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: baseMapUrls.satellite,
        crossOrigin: "anonymous",
      }),
    });

    const hybridLayer = new TileLayer({
      source: new XYZ({
        url: baseMapUrls.hybrid,
        crossOrigin: "anonymous",
      }),
      visible: showHybrid,
      zIndex: 1,
    });

    hybridLayerRef.current = hybridLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [satelliteLayer, hybridLayer],
      view: new View({
        center: [14135362.197, 4518290.522],
        zoom: 10,
        minZoom: 7,
        maxZoom: 20,
      }),
    });

    mapRef.current.olMap = map;

    return () => map.setTarget(null);
  }, []);

  // ✅ 지명 레이어 토글
  useEffect(() => {
    if (hybridLayerRef.current) {
      hybridLayerRef.current.setVisible(showHybrid);
    }
  }, [showHybrid]);

  // 🔥 히트맵 레이어 설정
  useEffect(() => {
    const map = mapRef.current?.olMap;
    if (!map) return;

    const config = layerConfig[selectedCrime];
    if (!config) return;

    const wmsSource = new TileWMS({
      url: "https://www.safemap.go.kr/openApiService/wms/getLayerData.do",
      params: {
        apikey: "0I7Z8J01-0I7Z-0I7Z-0I7Z-0I7Z8J014L",
        layers: config.layername,
        styles: config.styles,
        format: "image/png",
        transparent: true,
        service: "WMS",
        request: "GetMap",
        version: "1.3.0",
      },
      crossOrigin: "anonymous",
    });

    const newWmsLayer = new TileLayer({
      source: wmsSource,
      opacity: 0.7,
    });

    if (wmsLayerRef.current) {
      map.removeLayer(wmsLayerRef.current);
    }

    map.addLayer(newWmsLayer);
    wmsLayerRef.current = newWmsLayer;
  }, [selectedCrime]);

  return (
    <div className={styles.headerRow}>
      <div className={styles.controls}>
        {/* <label className={styles.labelToggle}>
          <input
            type="checkbox"
            checked={showHybrid}
            onChange={() => setShowHybrid((prev) => !prev)}
            style={{ marginRight: "6px" }}
          />
          지명 레이어 표시
        </label>

        <div className={styles.buttonGroup}>
          {Object.keys(layerConfig).map((crime) => (
            <button
              key={crime}
              onClick={() => setSelectedCrime(crime)}
              className={`${styles.crimeButton} ${
                selectedCrime === crime ? styles.crimeButtonActive : ""
              }`}
            >
              {crime}
            </button>
          ))}
        </div> */}
      </div>

      {/* 지도 출력 영역 */}
      <div className={styles.mapContainer}>
        <div ref={mapRef} className={styles.mapCanvas} />
        <CrimeLegend visible={true} selectedType={selectedCrime} />
      </div>
    </div>
  );
};

export default CrimeSafetyMap;
