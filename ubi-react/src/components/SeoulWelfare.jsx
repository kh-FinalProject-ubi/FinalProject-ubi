import React, { useEffect, useState } from "react";
import axios from "axios";

const SeoulWelfare = () => {
  const [services, setServices] = useState([]);
  // 주석달기

  useEffect(() => {
    axios
      .get("http://localhost:80/api/services")
      .then((response) => {
        setServices(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("데이터 불러오기 실패:", error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">공공서비스 목록</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">서비스번호</th>
            <th className="p-2 border">서비스명</th>
            <th className="p-2 border">기관</th>
            <th className="p-2 border">카테고리</th>
          </tr>
        </thead>
        <tbody>
          {services.map((item) => (
            <tr key={item.apiServiceId} className="border-b">
              <td className="p-2 border">{item.SVCID}</td>
              <td className="p-2 border">{item.SVCNM}</td>
              <td className="p-2 border">{item.DTLCONT}</td>
              <td className="p-2 border">{item.PLACENM}</td>
              <td className="p-2 border">{item.USETGTINFO}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeoulWelfare;
