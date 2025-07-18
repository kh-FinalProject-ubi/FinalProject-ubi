// 📁 src/components/map/KakaoMapView.jsx
import React, { useEffect, useState } from "react";

/**
 * KakaoMapView
 * @param {string} address - 주소 기반 지오코딩
 * @param {number} lat - 위도 (체육시설용)
 * @param {number} lng - 경도 (체육시설용)
 */

const KakaoMapView = ({ address, lat, lng }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const checkKakaoLoaded = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(checkKakaoLoaded);
        setLoaded(true);
      }
    }, 300);
  }, []);


  useEffect(() => {
    if (!loaded) return;

    const container = document.getElementById("map");
    const mapOption = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 기본 중심: 서울시청
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, mapOption);

    // 📍 1) 위도/경도 기반 표시 (체육시설)
    if (lat && lng) {
      const coords = new window.kakao.maps.LatLng(lat, lng);
      new window.kakao.maps.Marker({ map, position: coords });
      map.setCenter(coords);
      return;
    }



    // 📍 2) 주소 기반 표시 (복지시설)
    if (address) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          new window.kakao.maps.Marker({ map, position: coords });
          map.setCenter(coords);
        } else {
          console.error("주소 검색 실패:", status);
        }
      });
    }
  }, [loaded, address, lat, lng]);

  return (
    <div>
      {!loaded && <p>📡 지도를 불러오는 중입니다...</p>}
      <div id="map" style={{ width: "100%", height: "300px" }}></div>
    </div>
  );
};

export default KakaoMapView;
