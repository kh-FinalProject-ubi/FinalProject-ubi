import React from "react";
import { Link } from "react-router-dom";

/**
 * 시설 객체에서 다국어 키(FACLT_NM, 시설명 등)를 탐색해 값을 반환하는 함수
 */
const getField = (facility, ...keys) => {
  for (const key of keys) {
    const value = facility?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "정보 없음";
};

export default function FacilityCard({ facility }) {
  const name = getField(facility, "시설명", "FACLT_NM");

  return (
    <div className="facility-card p-3 border rounded-md shadow-sm hover:shadow-md transition duration-200 bg-white">
      <h3 className="text-lg font-semibold text-blue-600 hover:underline text-center">
        <Link to={`/facility/detail?name=${encodeURIComponent(name)}`}>
          {name}
        </Link>
      </h3>
    </div>
  );
}
