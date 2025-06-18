import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import CrimeLegend from "./components/CrimeLegend";

// 🌍 배경 지도 URL 설정 (VWorld 키 반영됨)
const baseMapUrls = {
  // vworld:
  //   "https://api.vworld.kr/req/wmts/1.0.0/3E730203-99F6-3B7E-8DED-879E725F5801/Base/{z}/{y}/{x}.png",
  satellite:
    "https://api.vworld.kr/req/wmts/1.0.0/3E730203-99F6-3B7E-8DED-879E725F5801/Satellite/{z}/{y}/{x}.jpeg",
  // osm: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
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

const CrimeSafetyMap = () => {
  const mapRef = useRef(null);
  const wmsLayerRef = useRef(null);
  const [selectedCrime, setSelectedCrime] = useState("전체");
  // const [selectedBaseMap, setSelectedBaseMap] = useState("vworld");
  const selectedBaseMap = "satellite";

  // 🗺️ 지도 초기화
  useEffect(() => {
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: baseMapUrls[selectedBaseMap],
        crossOrigin: "anonymous",
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer],
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

  // 배경 지도 변경
  useEffect(() => {
    const map = mapRef.current?.olMap;
    if (!map) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: baseMapUrls[selectedBaseMap],
        crossOrigin: "anonymous",
      }),
    });

    map.getLayers().setAt(0, baseLayer);
  }, [selectedBaseMap]);

  // WMS 히트맵 변경
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
    <div>
      <h3>범죄지도 히트맵</h3>

      {/* 지도 선택 */}
      {/* <div style={{ marginBottom: "10px" }}>
        {["vworld", "satellite", "osm"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedBaseMap(type)}
            style={{
              marginRight: "6px",
              backgroundColor: selectedBaseMap === type ? "#34495e" : "#bdc3c7",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div> */}

      {/* 범죄 유형 선택 */}
      <div style={{ marginBottom: "10px" }}>
        {Object.keys(layerConfig).map((crime) => (
          <button
            key={crime}
            onClick={() => setSelectedCrime(crime)}
            style={{
              marginRight: "6px",
              backgroundColor: selectedCrime === crime ? "#2c3e50" : "#95a5a6",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {crime}
          </button>
        ))}
      </div>

      {/* 지도 출력 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
        }}
      >
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        <CrimeLegend visible={true} selectedType={selectedCrime} />
      </div>
    </div>
  );
};

export default CrimeSafetyMap;
