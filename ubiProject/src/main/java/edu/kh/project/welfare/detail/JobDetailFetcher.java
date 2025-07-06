package edu.kh.project.welfare.detail;

import edu.kh.project.welfare.job.dto.WelfareFacilityJob;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component("job")
@RequiredArgsConstructor
public class JobDetailFetcher implements WelfareDetailFetcher {

    @Value("${api.job2.service-key}")
    private String serviceKey;

    private final RestTemplate restTemplate;

    @Override
    public Map<String, Object> fetchDetail(String apiServiceId) {
        try {
            String idStr = apiServiceId.replace("job-API2-", "");
            int targetIndex = Integer.parseInt(idStr);

            String url = "https://apis.data.go.kr/B552583/job/job_list_env?"
                    + "serviceKey=" + serviceKey
                    + "&pageNo=1&numOfRows=10000";

            String xml = restTemplate.getForObject(url, String.class);
            JSONObject json = XML.toJSONObject(xml);
            JSONArray items = json.getJSONObject("response")
                                  .getJSONObject("body")
                                  .getJSONObject("items")
                                  .optJSONArray("item");

            if (items != null && targetIndex >= 0 && targetIndex < items.length()) {
                JSONObject item = items.getJSONObject(targetIndex);

                // 필요한 정보만 추출해서 반환
                WelfareFacilityJob job = WelfareFacilityJob.builder()
                        .jobTitle(item.optString("jobNm"))
                        .jobStartDate(item.optString("termDate").split("~")[0].trim())
                        .jobEndDate(item.optString("termDate").split("~")[1].trim())
                        .jobSalary(item.optString("salary") + "원 / " + item.optString("salaryType"))
                        .jobRequirement("경력: " + item.optString("reqCareer") + ", 학력: " + item.optString("reqEduc"))
                        .jobContact(item.optString("regagnName"))
                        .jobContactTel(item.optString("cntctNo"))
                        .jobAddress(item.optString("compAddr"))
                        .regionCity(item.optString("compAddr").split("\\s+")[0])
                        .regionDistrict(item.optString("compAddr").split("\\s+")[1])
                        .jobPosition("장애인층")
                        .apiSource("API2")
                        .build();

                return Map.of("detail", job);
            }

            return Map.of("detail", null); // 못 찾았을 경우

        } catch (Exception e) {
            throw new RuntimeException("❌ 복지 일자리 상세 조회 실패", e);
        }
    }
}