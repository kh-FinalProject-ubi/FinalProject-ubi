package edu.kh.project.welfare.controller;

import edu.kh.project.welfare.detail.WelfareDetailFetcher;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/welfare")
@RequiredArgsConstructor
public class WelfareDetailController {

    private final Map<String, WelfareDetailFetcher> fetcherMap;

    @GetMapping("/detail")
    public Map<String, Object> getDetail(@RequestParam("apiServiceId") String apiServiceId) {
        String key = resolveKey(apiServiceId);

        WelfareDetailFetcher fetcher = fetcherMap.get(key);
        if (fetcher == null) {
            throw new IllegalArgumentException("지원하지 않는 서비스 유형입니다: " + apiServiceId);
        }

        return fetcher.fetchDetail(apiServiceId);
    }

    private String resolveKey(String apiServiceId) {
        if (apiServiceId.startsWith("bokjiro-")) return "bokjiro";
        if (apiServiceId.startsWith("seoul-")) return "seoul";
        if (apiServiceId.startsWith("job-API")) return "job";
        throw new IllegalArgumentException("알 수 없는 서비스 ID 형식입니다: " + apiServiceId);
    }
}