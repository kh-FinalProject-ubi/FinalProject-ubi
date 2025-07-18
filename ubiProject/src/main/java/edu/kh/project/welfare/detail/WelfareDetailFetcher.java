package edu.kh.project.welfare.detail;

import java.util.Map;

public interface WelfareDetailFetcher {
    Map<String, Object> fetchDetail(String apiServiceId);
}