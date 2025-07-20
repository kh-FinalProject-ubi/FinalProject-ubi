import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/TermsAndPrivacyModal.module.css";

const TermsContent = () => (
  <div>
    <h4>제1조 (목적)</h4>
    <p>
      이 약관은 우비(UBI, 이하 "회사")가 제공하는 지역별 혜택 정보 비교 및 관련 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
    </p>

    <h4>제2조 (정의)</h4>
    <p><strong>"회사"</strong>란 "UBI"라는 이름으로 지역별 혜택 비교 및 정보 제공 서비스를 운영하는 주체를 말합니다.</p>
    <p><strong>"이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</p>
    <p><strong>"콘텐츠"</strong>란 회사가 서비스를 통해 제공하거나 이용자가 서비스 내에서 게시한 텍스트, 이미지, 링크, 정보 등을 의미합니다.</p>
    <p><strong>"혜택 정보"</strong>란 국가 및 지자체, 공공기관 등에서 제공하는 각종 지원제도, 복지혜택, 정책 등을 말합니다.</p>

    <h4>제3조 (약관의 효력 및 변경)</h4>
    <p>
      이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
    </p>
    <p>
      회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지합니다.
    </p>
    <p>
      이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다. 변경된 약관의 효력 발생 이후에도 서비스를 계속 사용할 경우 변경사항에 동의한 것으로 간주합니다.
    </p>

    <h4>제4조 (서비스의 제공)</h4>
    <p>회사는 다음과 같은 서비스를 제공합니다.</p>
    <ul>
      <li>지역별 혜택 정보 검색 및 비교 서비스</li>
      <li>혜택 정보 요약 및 신청 방법 안내</li>
      <li>즐겨찾기 및 개인화 기능 (회원의 경우)</li>
      <li>기타 회사가 정하는 서비스</li>
    </ul>
    <p>회사는 시스템 점검, 장애, 서비스 개편 등 부득이한 경우 서비스를 일시 중단할 수 있습니다.</p>

    <h4>제5조 (이용자의 의무)</h4>
    <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
    <ul>
      <li>허위 정보의 입력 또는 타인의 정보 도용</li>
      <li>서비스에 게시된 정보의 무단 복제, 유통, 상업적 이용</li>
      <li>회사 또는 제3자의 저작권 등 권리를 침해하는 행위</li>
      <li>서비스의 정상적인 운영을 방해하는 행위</li>
    </ul>

    <h4>제6조 (개인정보 보호)</h4>
    <p>
      회사는 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하며, 개인정보의 수집·이용·처리에 관한 사항은 별도의 [개인정보처리방침]에 따릅니다.
    </p>

    <h4>제7조 (지적재산권)</h4>
    <p>
      회사가 작성한 콘텐츠 및 저작물에 대한 권리는 회사에 귀속됩니다.
    </p>
    <p>
      이용자가 서비스 내에 게시한 콘텐츠는 이용자 본인이 권리를 보유하나, 회사는 서비스 운영 및 홍보 목적으로 비상업적으로 이를 사용할 수 있습니다.
    </p>

    <h4>제8조 (책임의 제한)</h4>
    <p>
      회사는 공공기관으로부터 제공받는 정보를 기반으로 서비스를 제공하며, 정보의 정확성, 완전성, 최신성에 대해 보증하지 않습니다.
    </p>
    <p>
      회사는 이용자가 서비스를 통해 기대하는 수익, 혜택 등을 보장하지 않으며, 이로 인한 손해에 대해서도 책임을 지지 않습니다.
    </p>
    <p>
      회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
    </p>

    <h4>제9조 (서비스 해지 및 이용제한)</h4>
    <p>
      이용자는 언제든지 서비스 이용을 중단하고 탈퇴할 수 있습니다.
    </p>
    <p>
      회사는 이용자가 본 약관을 위반할 경우 사전 통지 없이 서비스 이용을 제한하거나 회원 자격을 박탈할 수 있습니다.
    </p>

    <h4>제10조 (준거법 및 재판관할)</h4>
    <p>
      이 약관은 대한민국 법률에 따라 해석되며, 회사와 이용자 간 분쟁에 대하여는 회사의 본사 소재지를 관할하는 법원을 제1심 관할법원으로 합니다.
    </p>
  </div>
);

const PrivacyContent = () => (
  <div>
    <h4>우비(UBI) 개인정보 처리방침</h4>
    <p>
      우비(UBI)(이하 “회사”)는 이용자의 개인정보를 소중하게 생각하며, 「개인정보 보호법」을 비롯한 관련 법령을 준수하고 있습니다.
      본 개인정보 처리방침은 회사가 어떤 정보를 수집하고, 어떻게 이용하며, 이용자의 권리를 어떻게 보호하는지를 설명합니다.
    </p>

    <h4>제1조 (개인정보의 수집 항목 및 수집 방법)</h4>
    <p>회사는 다음과 같은 방법으로 개인정보를 수집합니다:</p>
    <ol>
      <li>
        <strong>회원 가입 및 서비스 이용 시</strong><br />
        필수항목: 이름, 이메일 주소, 비밀번호<br />
        선택항목: 생년월일, 성별, 거주 지역
      </li>
      <li>
        <strong>서비스 이용 과정에서 자동으로 생성·수집되는 정보</strong><br />
        IP 주소, 쿠키, 서비스 이용 기록, 브라우저 종류, 접속 일시, 기기정보 등
      </li>
      <li>
        <strong>고객 문의, 이벤트 참여 등</strong><br />
        이름, 이메일, 전화번호, 문의 내용, 기타 사용자가 입력한 정보
      </li>
      <li>
        <strong>비회원 이용자의 경우</strong><br />
        서비스 조회 기록, 접속 정보 등 서비스 이용을 위한 최소한의 정보만 수집
      </li>
    </ol>

    <h4>제2조 (개인정보의 수집 및 이용 목적)</h4>
    <p>수집한 개인정보는 다음의 목적을 위해 이용됩니다.</p>
    <ul>
      <li>회원가입 및 본인 확인</li>
      <li>지역별 혜택 맞춤 정보 제공</li>
      <li>민원 및 고객상담 대응</li>
      <li>부정 이용 방지 및 보안 강화</li>
      <li>서비스 개선, 통계 및 분석</li>
      <li>이벤트 운영 및 마케팅 (이용자 동의 시)</li>
      <li>비회원 사용자의 이용 편의 향상</li>
    </ul>

    <h4>제3조 (개인정보의 보유 및 이용 기간)</h4>
    <p>회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만, 관련 법령에 따라 일정 기간 보관이 필요한 경우에는 그에 따릅니다.</p>
    <table border="1" cellPadding="5" style={{borderCollapse: 'collapse', width: '100%'}}>
      <thead>
        <tr>
          <th>항목</th>
          <th>보관 기간</th>
          <th>보관 근거</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>회원 정보(이메일 등)</td>
          <td>탈퇴 후 7일 이내 파기</td>
          <td>내부 정책</td>
        </tr>
        <tr>
          <td>문의 및 고객지원 기록</td>
          <td>3년</td>
          <td>소비자기본법</td>
        </tr>
        <tr>
          <td>접속 로그, IP 등</td>
          <td>3개월</td>
          <td>통신비밀보호법</td>
        </tr>
      </tbody>
    </table>

    <h4>제4조 (개인정보의 제3자 제공)</h4>
    <p>회사는 이용자의 개인정보를 외부에 제공하지 않으며, 다음의 경우에만 제공할 수 있습니다.</p>
    <ul>
      <li>이용자의 사전 동의를 받은 경우</li>
      <li>법령에 따라 제공이 요구되는 경우</li>
      <li>통계, 학술연구, 시장조사를 위해 특정 개인을 식별할 수 없는 형태로 제공하는 경우</li>
    </ul>

    <h4>제5조 (개인정보의 처리 위탁)</h4>
    <p>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁할 수 있습니다.</p>
    <table border="1" cellPadding="5" style={{borderCollapse: 'collapse', width: '100%'}}>
      <thead>
        <tr>
          <th>수탁업체</th>
          <th>위탁업무 내용</th>
          <th>보유 및 이용 기간</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Amazon Web Services</td>
          <td>인프라 및 데이터 보관</td>
          <td>계약 종료 시까지</td>
        </tr>
        <tr>
          <td>Google Analytics</td>
          <td>이용자 행동 분석</td>
          <td>익명 통계 기반, 개별 식별 불가</td>
        </tr>
      </tbody>
    </table>
    <p>※ 회사는 수탁자와의 계약을 통해 개인정보 보호 의무를 명확히 규정하고 있습니다.</p>

    <h4>제6조 (쿠키(Cookie)의 수집 및 사용)</h4>
    <p>회사는 웹사이트 운영에 필요한 쿠키를 사용할 수 있습니다.</p>
    <ul>
      <li><strong>쿠키란:</strong> 이용자의 브라우저에 저장되는 소량의 정보로, 서비스 최적화에 활용됩니다.</li>
      <li><strong>이용 목적:</strong> 접속 유지, 이용자 선호 저장, 통계 분석 등</li>
      <li><strong>차단 방법:</strong> 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.<br />
      (예: Chrome 기준: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터)</li>
    </ul>
    <p>※ 쿠키를 차단할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</p>

    <h4>제7조 (이용자의 권리와 행사 방법)</h4>
    <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
    <ul>
      <li>개인정보 조회 및 열람</li>
      <li>개인정보 정정 및 삭제 요청</li>
      <li>처리 정지 요청</li>
      <li>회원 탈퇴 및 개인정보 파기 요청</li>
    </ul>
    <p><strong>행사 방법:</strong> [문의하기] 기능 또는 이메일 (support@ubi.co.kr)을 통해 요청<br />
    법정대리인을 통한 대리 요청도 가능 (신분증 사본 제출 필요)</p>

    <h4>제8조 (만 14세 미만 아동의 개인정보 처리)</h4>
    <p>
      회사는 원칙적으로 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
      만약 수집이 필요한 경우에는 법정대리인의 동의를 필수로 받고, 관련 법령에 따라 안전하게 보호합니다.
    </p>

    <h4>제9조 (개인정보의 파기 절차 및 방법)</h4>
    <p>회사는 개인정보 보유기간 경과 또는 처리 목적 달성 시 지체 없이 해당 정보를 파기합니다.</p>
    <ul>
      <li>전자적 파일: 복구 불가능한 기술적 방법으로 완전 삭제</li>
      <li>종이 문서: 분쇄하거나 소각</li>
    </ul>

    <h4>제10조 (개인정보의 안전성 확보 조치)</h4>
    <p>회사는 개인정보 보호를 위해 다음과 같은 조치를 시행하고 있습니다.</p>
    <ul>
      <li>개인정보 암호화 저장</li>
      <li>접근 권한 최소화 및 내부 직원 교육</li>
      <li>백신 및 보안 프로그램 운영</li>
      <li>침해사고 대비 이중 백업 및 서버 방화벽 설정</li>
    </ul>

    <h4>제11조 (개인정보 보호책임자 및 문의처)</h4>
    <p>회사는 개인정보 보호에 관한 업무를 총괄하는 책임자를 두고 있으며, 이용자의 문의에 신속하고 성실하게 대응합니다.</p>
    <p>
      개인정보 보호책임자: 홍길동<br />
      연락처: support@ubi.co.kr<br />
      문의 방법: [UBI 고객센터] 또는 ‘문의하기’ 메뉴를 통해 접수
    </p>

    <h4>제12조 (권익침해에 대한 구제방법)</h4>
    <p>이용자는 아래 기관에 개인정보 침해에 대한 상담 및 분쟁 조정을 요청할 수 있습니다.</p>
    <ul>
      <li>개인정보침해 신고센터: privacy.kisa.or.kr / 국번없이 118</li>
      <li>개인정보 분쟁조정위원회: kopico.go.kr / 1833-6972</li>
      <li>대검찰청 사이버수사과: spo.go.kr / 국번없이 1301</li>
      <li>경찰청 사이버수사국: cyber.go.kr / 국번없이 182</li>
    </ul>

    <h4>제13조 (개인정보 처리방침 변경에 대한 고지)</h4>
    <p>본 개인정보 처리방침은 관련 법령 및 정책 변경에 따라 사전 공지 후 개정될 수 있습니다.</p>
    <p>공고일자: 2025년 6월 20일<br />
    시행일자: 2025년 6월 20일</p>
  </div>
);


const TermsAndPrivacyModal = ({ open, onClose, onAgree, view }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // --- 드래그 기능 추가를 위한 상태와 Ref ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (open) {
      setIsChecked(false);
      // 모달이 열릴 때 화면 중앙에 위치하도록 초기화
      const modalElement = modalRef.current;
      if (modalElement) {
        const { innerWidth, innerHeight } = window;
        const { offsetWidth, offsetHeight } = modalElement;
        setPosition({
          x: (innerWidth - offsetWidth) / 2,
          y: (innerHeight - offsetHeight) / 2,
        });
      }
    }
  }, [open]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // 애니메이션 시간과 동일하게 설정
  };

  // 🐛 문제 해결: 이벤트 버블링을 막는 핸들러
  const handleWrapperClick = (e) => {
    // 모달 내부를 클릭했을 때는 닫히지 않도록 이벤트 전파를 막음
    e.stopPropagation();
  };

  const handleAgree = () => {
    if (!isChecked) {
      alert("약관에 동의해주세요.");
      return;
    }
    onAgree();
    handleClose();
  };
  
  // --- 🖱️ 드래그 기능 핸들러 ---
  const onDragStart = (e) => {
    setIsDragging(true);
    const modalElement = modalRef.current;
    if (modalElement) {
        offsetRef.current = {
            x: e.clientX - modalElement.offsetLeft,
            y: e.clientY - modalElement.offsetTop,
        };
    }
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    });
  };
  
  const onDragEnd = () => {
    setIsDragging(false);
  };
  
  // 마우스 이동과 뗄 때 이벤트를 window 전체에 등록/해제
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const title = view === 'terms' ? '이용 약관' : '개인정보 수집 및 이용 동의';
  const content = view === 'terms' ? <TermsContent /> : <PrivacyContent />;

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div
        ref={modalRef}
        className={`${styles.modalContainer} ${isClosing ? styles.slideUp : styles.slideDown}`}
        onClick={handleWrapperClick} // 모달 컨테이너 클릭 시 버블링 방지
        style={{ top: `${position.y}px`, left: `${position.x}px` }} // 위치 적용
      >
        <div 
            className={styles.modalHeader}
            onMouseDown={onDragStart} // 헤더를 잡고 드래그 시작
        >
          <h2>{title}</h2>
          {/* 버튼 클릭 시 버블링이 일어나지 않으므로 handleClose 직접 사용 가능 */}
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        <div className={styles.modalContent}>{content}</div>

        <div className={styles.modalFooter}>
  <label>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={(e) => setIsChecked(e.target.checked)}
    />
    {/* 이 span이 실제로 보이는 커스텀 체크박스입니다. */}
    <span></span>
    동의합니다.
  </label>
  <button 
    className={styles.confirmButton} 
    onClick={handleAgree}
    disabled={!isChecked}
  >
    확인
  </button>
</div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyModal;