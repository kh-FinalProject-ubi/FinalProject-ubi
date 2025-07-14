// components/modal/LocalBenefitModal.jsx
import React from "react";
import LocalBenefitSection from "../../components/welfareService/LocalBenefitSection";


const LocalBenefitModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="지역 복지 혜택 모달"
      className="local-benefit-modal"
      overlayClassName="local-benefit-overlay"
    >
      <div className="modal-header">
        <h2>📍 지역 복지 혜택 선택</h2>
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
      </div>
      <div className="modal-body">
        <LocalBenefitSection onSelect={onSelect} /> {/* ✅ 선택 콜백 전달 */}
      </div>
    </Modal>
  );
};

export default LocalBenefitModal;
