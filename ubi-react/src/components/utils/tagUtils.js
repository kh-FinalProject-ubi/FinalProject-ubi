
export function generateTagList(board) {
  const tagList = [];

  

  // 시군구 해시태그
  if (board.regionCity && board.regionDistrict) {
    tagList.push(`${board.regionCity} ${board.regionDistrict}`);
  }

  // 복지 서비스 유형 또는 서브카테고리 이름
  if (board.apiServiceId) {
    tagList.push('복지서비스후기');
  } else if (board.facilityApiServiceId) {
    tagList.push('복지시설후기');
  } else if (board.postType) {
    tagList.push(board.postType);
  }


  // 기존 DB 해시태그
  if (board.hashtags) {
    tagList.push(...board.hashtags.split(',').map(tag => tag.trim()));
  }
  return tagList;
}