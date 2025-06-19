import { useEffect, useState } from "react";
import axios from "axios";

// const  WelfareFacilityJobList = () => {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     const loadJobs = async () => {
//       const data = await fetchWelfareJobs();
//       setJobs(data);
//     };
//     loadJobs();
//   }, []);
  
function WelfareFacilityJobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get("/api/facilityjob")
      .then(res => setJobs(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>복지 시설 채용공고</h2>
      <table>
        <thead>
          <tr>
            <th>채용정보</th>
            <th>접수시작일</th>
            <th>접수마감일</th>
            <th>임금 조건</th>
            <th>채용분야</th>
            <th>채용조건</th>
            <th>담당자/연락처</th>
            <th>시군구</th>
            <th>주소</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, idx) => (
            <tr key={idx}>
              <td>{job.jobTitle}</td>
              <td>{job.jobStartDate}</td>
              <td>{job.jobEndDate}</td> 
              <td>{job.jobSalary}</td>
              <td>{job.jobPosition}</td>
              <td>{job.jobRequirement}</td>
              <td>{job.jobContact} / {job.jobContactTel}</td>
              <td>{job.regionCity} {job.regionDistrict}</td>
              <td>{job.jobAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WelfareFacilityJobList;