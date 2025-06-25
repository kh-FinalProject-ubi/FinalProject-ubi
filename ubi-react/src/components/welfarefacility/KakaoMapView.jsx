// 📁 src/components/map/KakaoMapView.jsx
import React, { useEffect, useState } from "react";

const KakaoMapView = ({ address }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Kakao Maps SDK가 로드될 때까지 확인
    const checkKakaoLoaded = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(checkKakaoLoaded);
        setLoaded(true);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (!loaded || !address) return;

    const container = document.getElementById("map");
    const mapOption = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 기본 중심: 서울시청
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, mapOption);

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
  }, [loaded, address]);

  return (
    <div>
      {!loaded && <p>📡 지도를 불러오는 중입니다...</p>}
      <div id="map" style={{ width: "100%", height: "300px" }}></div>
    </div>
  );
};

export default KakaoMapView;
