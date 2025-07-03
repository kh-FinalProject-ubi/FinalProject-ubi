package edu.kh.project.welfare.job.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import edu.kh.project.welfare.job.dto.WelfareFacilityJob;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WelfareFacilityJobServiceImpl implements WelfareFacilityJobService {

    private final RestTemplate restTemplate;

    @Value("${api.job1.service-key}")
    private String serviceKey1;

    @Value("${api.job2.service-key}")
    private String serviceKey2;

    @Override
    public List<WelfareFacilityJob> getAllJobs() {
        List<WelfareFacilityJob> result = new ArrayList<>();

//        // ✅ 노년계층
//        result.addAll(callApi1()); 데이터 부족으로 제외

        // ✅ 장애인계층
        for (Map<String, Object> item : callApi2()) {
            result.add(fromApi2(item));
        }

        return result;
    }

    private List<WelfareFacilityJob> callApi1() {
        try {
            String url = "http://apis.data.go.kr/B552474/SenuriService/getJobList?"
                    + "ServiceKey=" + serviceKey1
                    + "&numOfRows=1000&pageNo=1"
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

            Object itemObj = json.getJSONObject("response")
                    .getJSONObject("body")
                    .getJSONObject("items")
                    .get("item");

            List<WelfareFacilityJob> list = new ArrayList<>();

            LocalDate today = LocalDate.now();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMdd");

            if (itemObj instanceof JSONArray items) {
                for (int i = 0; i < items.length(); i++) {
                    JSONObject item = items.getJSONObject(i);
                    String toDd = item.optString("toDd");

                    if (toDd != null && !toDd.isBlank()) {
                        try {
                            LocalDate end = LocalDate.parse(toDd.trim(), fmt);
                            if (end.isBefore(today)) continue; // ❌ 마감된 공고 skip
                        } catch (Exception e) {
                            // 파싱 실패 시 무시하고 통과시킴
                        }
                    }

                    list.add(fromApi1(item));
                }
            } else if (itemObj instanceof JSONObject item) {
                String toDd = item.optString("toDd");
                if (toDd != null && !toDd.isBlank()) {
                    try {
                        LocalDate end = LocalDate.parse(toDd.trim(), fmt);
                        if (end.isBefore(today)) return List.of(); // ❌ 단일 공고지만 마감
                    } catch (Exception e) {
                        // skip
                    }
                }
                list.add(fromApi1(item));
            }

            return list;

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private WelfareFacilityJob fromApi1(JSONObject jobInfo) {
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
                .jobPosition("노년층")
                .jobContact(jobInfo.optString("regagnName"))
                .jobContactTel(jobInfo.optString("cntctNo"))
                .jobRequirement(requirement)
                .regionDistrict(parts.length > 1 ? parts[1] : "")
                .regionCity(parts.length > 0 ? parts[0] : "")
                .jobAddress(address)
                .apiSource("API1")
                .build();
    }

    private List<Map<String, Object>> callApi2() {
        try {
            String url = "https://apis.data.go.kr/B552583/job/job_list_env?"
                    + "serviceKey=" + serviceKey2 + "&pageNo=1&numOfRows=10000";

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
