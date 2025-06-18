import json

special_city_names = {
    "수원시": "수원특례시",
    "용인시": "용인특례시",
    "성남시": "성남특례시",
    "고양시": "고양특례시",
    "창원시": "창원특례시",
}

with open('TL_SCCO_SIG_with_FULL_NM.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_features = []

for feature in data['features']:
    props = feature['properties']
    sig_kor_nm = props.get('SIG_KOR_NM', '')
    full_nm = props.get('FULL_NM', '')
    level1 = full_nm.split()[0] if ' ' in full_nm else ''
    level2 = full_nm.split()[1] if len(full_nm.split()) >= 2 else ''

    full_nm_clean = ""

    if "특례시" in level2:
        full_nm_clean = f"{level1} {level2}"
    elif any(city in sig_kor_nm for city in special_city_names.keys()):
        for city in special_city_names.keys():
            if city in sig_kor_nm:
                full_nm_clean = f"{level1} {special_city_names[city]}"
                break
    elif "구" in sig_kor_nm and "시" in sig_kor_nm:
        # ⭐ 일반 시 + 구 → 시로 통합 (안양, 안산 등)
        for part in sig_kor_nm.split(" "):
            if "시" in part:
                full_nm_clean = f"{level1} {part}"
                break
    elif "구" in sig_kor_nm:
        # 광역시 하위 구는 그대로 유지
        full_nm_clean = full_nm
    else:
        # 일반 시/군 그대로
        full_nm_clean = full_nm

    new_props = {
        'SIG_CD': props.get('SIG_CD', ''),
        'SIG_ENG_NM': props.get('SIG_ENG_NM', ''),
        'SIG_KOR_NM': sig_kor_nm,
        'FULL_NM': full_nm,
        'FULL_NM_CLEAN': full_nm_clean
    }

    feature['properties'] = new_props
    new_features.append(feature)

new_data = {
    'type': 'FeatureCollection',
    'features': new_features
}

with open('TL_SCCO_SIG_with_FULL_NM_CLEAN.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print("✅ Clean 완료 → TL_SCCO_SIG_with_FULL_NM_CLEAN.json 생성됨!")