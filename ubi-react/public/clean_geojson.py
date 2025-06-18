import json
from tqdm import tqdm

# 특례시 + 추가 시 구 제거 대상 (안산시, 안양시 포함)
special_city_mapping = {
    "수원시": "수원특례시",
    "용인시": "용인특례시",
    "성남시": "성남특례시",
    "고양시": "고양특례시",
    "안양시": "안양시",
    "안산시": "안산시",
}

# 원본 파일 경로
input_path = "TL_SCCO_SIG_with_FULL_NM.json"
# 출력 파일 경로
output_path = "TL_SCCO_SIG_with_FULL_NM_clean.json"

# 원본 GeoJSON 로드
with open(input_path, "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# 전체 feature 순회
for feature in tqdm(geojson_data["features"]):
    props = feature["properties"]
    full_nm_original = props["FULL_NM"]

    tokens = full_nm_original.split()

    # 기본 방어 코드
    if len(tokens) < 2:
        print(f"❌ 잘못된 FULL_NM: {full_nm_original}")
        continue

    sido = tokens[0]
    시이름 = tokens[1]
    gu_gun = tokens[2] if len(tokens) >= 3 else ""

    # 순서 중요!! 시이름 먼저 체크 → 특례시 또는 구 제거 대상 먼저 적용
    if 시이름 in special_city_mapping:
        new_full_nm = f"{sido} {special_city_mapping[시이름]}"
    elif gu_gun == "":
        # 구가 없는 경우 (군, 시 단독일 경우)
        new_full_nm = f"{sido} {시이름}"
    else:
        # 나머지는 그대로 유지
        new_full_nm = full_nm_original

    # 결과 저장
    props["FULL_NM_CLEAN"] = new_full_nm

# 최종 저장
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(geojson_data, f, ensure_ascii=False, indent=2)

print("✅ 특례시/구 제거 통합 + 최종 저장 완료!")
