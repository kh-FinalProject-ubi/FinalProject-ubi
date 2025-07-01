package edu.kh.project.welfare.job.service;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import edu.kh.project.welfare.job.dto.WelfareFacilityJob;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class WelfareFacilityJobServiceImpl implements WelfareFacilityJobService{

	private final RestTemplate restTemplate;
	
    
	
	 // 노년계층 
    @Value("${api.job1.service-key}")
    private String serviceKey1;
    
    // 장애인계층 
    @Value("${api.job2.service-key}")
    private String serviceKey2;
    

    @Override
    public List<WelfareFacilityJob> getAllJobs() {
        List<WelfareFacilityJob> result = new ArrayList<>();

        for (String id : getJobIdListFromApi1()) {
            WelfareFacilityJob detail = getJobDetailFromApi1(id);
            if (detail != null) result.add(detail);
       }

        for (Map<String, Object> item : callApi2()) {
            result.add(fromApi2(item));
        }

        return result;
    }

    // 목록 조회 http://apis.data.go.kr/B552474/SenuriService/getJobList?ServiceKey=인증키&numOfRows=1&pageNo=1
    
    private List<String> getJobIdListFromApi1() {
        try {
            String url = "http://apis.data.go.kr/B552474/SenuriService/getJobList?"
                       + "ServiceKey=" + serviceKey1
                       + "&numOfRows=1000&pageNo=1"
                       + "&_type=json";  // ✅ JSON 요청

            String jsonStr = restTemplate.getForObject(url, String.class);
            JSONObject json = new JSONObject(jsonStr);

            Object itemObj = json.getJSONObject("response")
                                 .getJSONObject("body")
                                 .getJSONObject("items")
                                 .get("item");

            List<String> ids = new ArrayList<>();
            if (itemObj instanceof JSONArray items) {
                for (int i = 0; i < items.length(); i++) {
                    ids.add(items.getJSONObject(i).optString("jobId"));
                }
            } else if (itemObj instanceof JSONObject item) {
                ids.add(item.optString("jobId"));
            }

            return ids;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    
    // 상세조회 http:// apis.data.go.kr/B552474/SenuriService/getJobInfo?ServiceKey=인증키&id=채용공고ID

    public WelfareFacilityJob getJobDetailFromApi1(String id) {
        try {
            String url = "http://apis.data.go.kr/B552474/SenuriService/getJobInfo?"
                       + "ServiceKey=" + serviceKey1
                       + "&id=" + id
                       + "&_type=json";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );

            String body = response.getBody();
            JSONObject json = new JSONObject(body);

            JSONObject jobInfo = json.getJSONObject("response")
                                     .getJSONObject("body")
                                     .getJSONObject("items")
                                     .getJSONObject("item");

            String address = jobInfo.optString("compAddr", "");
            String[] parts = address.split("\\s+");
            String termDate = jobInfo.optString("termDate", "");
            String[] dateParts = termDate.split("~");
            String start = dateParts.length > 0 ? dateParts[0].trim() : "";
            String end = dateParts.length > 1 ? dateParts[1].trim() : "";
            String salary = jobInfo.optString("salary", "") + " 원 / " + jobInfo.optString("salaryType", "");
            String requirement = "경력: " + jobInfo.optString("reqCareer", "") + ", 학력: " + jobInfo.optString("reqEduc", "");

            return WelfareFacilityJob.builder()
                    .jobTitle(join(jobInfo.optString("busplaName"), jobInfo.optString("jobNm"), jobInfo.optString("empType"), "모집"))
                    .jobStartDate(start)
                    .jobEndDate(end)
                    .jobSalary(salary)
                    .jobPosition("노년층") // API1 용
                    .jobContact(jobInfo.optString("regagnName"))
                    .jobContactTel(jobInfo.optString("cntctNo"))
                    .jobRequirement(requirement)
                    .regionDistrict(parts.length > 1 ? parts[1] : "")
                    .regionCity(parts.length > 0 ? parts[0] : "")
                    .jobAddress(address)
                    .apiSource("API1")
                    .build();

        } catch (JSONException e) {
            System.err.println("❌ JSON 파싱 실패: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("❌ API1 상세조회 실패: " + e.getMessage());
            return null;
        }
    }
        
      
      
    


    private List<Map<String, Object>> callApi2() {
        try {
            String url = "https://apis.data.go.kr/B552583/job/job_list_env?"
                    + "serviceKey=" + serviceKey2 + "&pageNo=1&numOfRows=1000";

            String xml = restTemplate.getForObject(url, String.class);
            JSONObject json = XML.toJSONObject(xml);
            JSONArray items = json.getJSONObject("response")
                    .getJSONObject("body")
                    .getJSONObject("items")
                    .optJSONArray("item");

            List<Map<String, Object>> result = new ArrayList<>();
            if (items != null) {
                for (int i = 0; i < items.length(); i++) {
                    result.add(items.getJSONObject(i).toMap());
                }
            }
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private WelfareFacilityJob fromApi2(Map<String, Object> api) {
        String address = get(api, "compAddr");
        String[] parts = address.split("\\s+");
        String termDate = get(api, "termDate");
        String[] dateParts = termDate.split("~");
        String start = dateParts.length > 0 ? dateParts[0].trim() : "";
        String end = dateParts.length > 1 ? dateParts[1].trim() : "";
        String salary = get(api, "salary") + " 원 / " + get(api, "salaryType");
        String requirement = "경력: " + get(api, "reqCareer") + ", 학력: " + get(api, "reqEduc");

        return WelfareFacilityJob.builder()
                .jobTitle(join(get(api, "busplaName"), get(api, "jobNm"), get(api, "empType"), "모집"))
                .jobStartDate(start)
                .jobEndDate(end)
                .jobSalary(salary)
                .jobPosition("장애인층")
                .jobContact(get(api, "regagnName"))
                .jobContactTel(get(api, "cntctNo"))
                .jobRequirement(requirement)
                .regionDistrict(parts.length > 1 ? parts[1] : "")
                .regionCity(parts.length > 0 ? parts[0] : "")
                .jobAddress(address)
                .apiSource("API2")
                .build();
    }

    private String get(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val == null ? "" : val.toString();
    }

    private String join(String... parts) {
        return String.join(" ", Arrays.stream(parts)
                .filter(s -> s != null && !s.isBlank())
                .toArray(String[]::new));
    }
}

