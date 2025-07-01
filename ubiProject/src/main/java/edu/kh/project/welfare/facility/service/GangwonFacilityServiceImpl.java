package edu.kh.project.welfare.facility.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import edu.kh.project.welfare.facility.dto.GyeonggiFacility;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GangwonFacilityServiceImpl implements GangwonFacilityService {

    // 처리할 CSV 파일 목록 (resources/data/ 기준 상대경로)
    private static final String[] CSV_FILES = {
        "/data/강원도복지_노인.csv",
        "/data/강원도복지_아동.csv",
        "/data/강원도복지_장애인.csv"
    };

    @Override
    public List<GyeonggiFacility> getFacilitiesFromCsv() {
        List<GyeonggiFacility> result = new ArrayList<>();

        for (String csvPath : CSV_FILES) {
            result.addAll(parseCsv(csvPath));
        }

        log.info("✅ 강원도 전체 CSV 병합 완료. 총 개수: {}", result.size());
        return result;
    }

    // 개별 파일 파싱
    private List<GyeonggiFacility> parseCsv(String path) {
        List<GyeonggiFacility> list = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                    getClass().getResourceAsStream(path),
                    StandardCharsets.UTF_8
                ))) {

            String line;
            boolean isFirst = true;

            while ((line = br.readLine()) != null) {
                if (isFirst) { isFirst = false; continue; }

                String[] t = line.split(",");

                if (t.length < 7) continue; // 컬럼 누락 방지

                GyeonggiFacility f = new GyeonggiFacility();
                f.setFacilityName(t[0]);
                f.setRefineRoadnmAddr(t[1]);
                f.setTel(t[2]);
                f.setHomepage(t[3]);
                f.setLat(t[4]);
                f.setLng(t[5]);
                f.setRegionCity("강원도");
                f.setRegionDistrict(t[6]);
                f.setApiType("csv");

                list.add(f);
            }

            log.info("📄 {} 읽은 항목 수: {}", path, list.size());

        } catch (IOException | NullPointerException e) {
            log.error("💥 CSV 파싱 실패 - {}", path, e);
        }

        return list;
    }
}