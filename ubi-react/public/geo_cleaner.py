import json
from tqdm import tqdm

# 시도 매핑 (특별자치도 반영 포함)
sido_mapping = {
    "경기도 수원시": "경기도 수원특례시",
    "경기도 고양시": "경기도 고양특례시",
    "경기도 용인시": "경기도 용인특례시",
    "경기도 성남시": "경기도 성남특례시",
    "강원도": "강원특별자치도",
    "전라북도": "전북특별자치도",
    "제주특별자치도": "제주특별자치도",
    # 나머지는 그대로 유지
    "경기도": "경기도",
    "서울특별시": "서울특별시",
    "부산광역시": "부산광역시",
    "인천광역시": "인천광역시",
    "대구광역시": "대구광역시",
    "광주광역시": "광주광역시",
    "대전광역시": "대전광역시",
    "울산광역시": "울산광역시",
    "세종특별자치시": "세종특별자치시",
    "충청북도": "충청북도",
    "충청남도": "충청남도",
    "전라남도": "전라남도",
    "경상북도": "경상북도",
    "경상남도": "경상남도",
}

# 특례시 구 통합용
special_cases = {
    "경기도 수원시": "경기도 수원특례시",
    "경기도 고양시": "경기도 고양특례시",
    "경기도 용인시": "경기도 용인특례시",
    "경기도 성남시": "경기도 성남특례시",
}

# 군위군 예외 처리 (대구로 변경)
gunwi_exception = {
    "경상북도 군위군": "대구광역시 군위군"
}

# 입력 및 출력 경로
input_path = "TL_SCCO_SIG_with_FULL_NM.json"
output_path = "TL_SCCO_SIG_with_FULL_NM_FINAL.json"

# JSON 로드
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 변환 시작
for feature in tqdm(data["features"]):
    props = feature["properties"]

    level1 = ""
    level2 = ""

    full_nm = props["FULL_NM"].strip()

    # 군위군 예외 우선 적용
    if full_nm in gunwi_exception:
        full_nm_clean = gunwi_exception[full_nm]
    else:
        # 기본 구조 파싱
        parts = full_nm.split(" ")
        if len(parts) >= 2:
            level1 = parts[0]
            level2 = parts[1]

            # 시군구 레벨 판단
            if level2.endswith("시"):
                # 특례시 적용 여부 확인
                if full_nm in special_cases:
                    full_nm_clean = special_cases[full_nm]
                else:
                    full_nm_clean = full_nm
            elif level2.endswith("군") or level2.endswith("구"):
                # 시도명 매핑 적용 후 level2 유지
                level1_mapped = sido_mapping.get(level1, level1)
                full_nm_clean = f"{level1_mapped} {level2}"
            else:
                # 기타 경우 (그대로 유지)
                full_nm_clean = full_nm
        else:
            # 방어 코드 (혹시 1단어일 경우 그대로 유지)
            full_nm_clean = full_nm

    # 최종 값 저장
    props["FULL_NM_CLEAN"] = full_nm_clean

# 저장
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ 최종 FULL_NM_CLEAN 적용 완료 → TL_SCCO_SIG_with_FULL_NM_FINAL.json 저장됨!")