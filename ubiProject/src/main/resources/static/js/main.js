// 쿠키에 저장된 이메일 input창에 입력해놓기
// 로그인이 안된 경우에 수행

// 쿠키에서 매개변수로 전달받은 key와 일치하는 value 얻어와 반환하는 함수
const getCookie = (key) => {
  const cookies = document.cookie;  // "K=V; K=V;..."

  // console.log(cookies);
  // cookies 에 저장된 문자열을 배열 혈태로 변환
  const cookieList = cookies.split("; ")  // ["K=V" , "K=V",...]
                     .map(el => el.split("=")); // [["K=V"] , ["K=V"] ...]

    // 배열.map(함수) : 배열의 각 요소를 이용해 콜백함수 수행 후
    //                 결과값으로 새로운 배열을 만들어서 반환하는 JS 내장 함수

    
    console.log(cookieList);
    /*
    [
      ['saveId', 'user01@kh.or.kr'],
      ['test', 'testValue']  
      ]
      2차원 배열 형태임
      배열 -> JS 객체로 변환 (그래야 다루기 쉬움)
  */

  const obj = {}; // 비어있는 객체 선언

  for(let i = 0; i < cookieList.length; i++){
    const k = cookieList[i][0];
    const v = cookieList[i][1];
    obj[k] = v; // obj 객체에 K:V 형태로 추가
    // obj["saveId"] = 'user01@kh.or.kr';
    // obj["test"] = 'testValue";
  }
 
  console.log(obj);

  return obj[key];  // 매개변수로 전달받은 key와
                    // obj 객체에 저장된 key가 일치하는 요소의 value값 반환

}

// 이메일 작성 input 태그 요소
const loginEmail = document.querySelector("#loginForm input[name='memberEmail']");

if(loginEmail != null) {  // 로그인폼의 이메일 input 태그가 화면상에 존재할 때

  // 쿠키 중 key 값이 "saveId"인 요소의 value 얻어오기
  const saveId = getCookie("saveId");

  // saveId 값이 있을 경우
  if(saveId != undefined) {
    loginEmail.value = saveId; // 쿠키에서 얻어온 이메일 값을 input 요소의 value에 세팅
    // 아이디 저장 체크박스에 체크해두기
    document.querySelector("input[name='saveId']").checked = true;

  }
}

// 이메일 비밀번호 작성되어있지 않을 시 제출 x
const loginForm = document.querySelector("#loginForm");
const memberPw = document.querySelector("#loginForm input[name='memberPw']");

if (loginForm) {
  loginForm.addEventListener("submit", function(event) {
    // 아이디나 비밀번호가 비어있는지 확인
    if (loginEmail.value.trim() === "" || memberPw.value.trim() === "") {
      alert("아이디와 비밀번호는 필수입력 사항입니다.");
      event.preventDefault();  // 폼 제출을 막음
    }
  });
}