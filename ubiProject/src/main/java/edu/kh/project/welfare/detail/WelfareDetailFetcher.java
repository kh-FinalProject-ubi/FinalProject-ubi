package edu.kh.project.welfare.detail;

import java.util.Map;

public interface WelfareDetailFetcher {

	 /**
     * 주어진 apiServiceId를 기반으로 상세 복지 정보를 반환합니다.
     * @param apiServiceId ex) bokjiro-WLF00004069, seoul-S2505..., job-API2-56 등
     * @return JSON 형태의 복지 상세 정보
     */
    Map<String, Object> fetchDetail(String apiServiceId);
}

