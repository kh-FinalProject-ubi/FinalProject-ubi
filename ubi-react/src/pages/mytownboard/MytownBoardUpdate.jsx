import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import 'summernote/dist/summernote-lite.css';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.js';
import useAuthStore from '../../stores/useAuthStore';

function MytownBoardUpdate() {
  const { boardNo } = useParams();
  const { memberNo: loginMemberNo } = useAuthStore();
  const [board, setBoard] = useState(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [boardContent, setBoardContent] = useState('');
  const uploadedImagesRef = useRef([]);
  const navigate = useNavigate();
const isInitialSet = useRef(true); // 처음 한 번만 true
// ✅ handleUpdate 내부에서 imageList를 객체 형태로 변환
const imageList = uploadedImagesRef.current.map((url, index) => ({
  imagePath: url,
  imageOrder: index
}));





  // 1. 게시글 데이터 불러오기
  useEffect(() => {
    if (!boardNo || isNaN(boardNo)) {
      alert("잘못된 접근입니다.");
      navigate("/mytownBoard");
      return;
    }

    axios.get(`/api/board/mytownBoard/${boardNo}`)
      .then(res => {
        const data = res.data;

        if (data.memberNo !== loginMemberNo) {
          alert("작성자만 수정할 수 있습니다.");
          navigate("/mytownBoard");
          return;
        }

        setBoard(data);
        setBoardTitle(data.boardTitle);
        setBoardContent(data.boardContent);
      })
      .catch(err => {
        console.error("게시글 불러오기 실패", err);
        alert("게시글 정보를 가져오지 못했습니다.");
        navigate("/mytownBoard");
      });
  }, [boardNo, loginMemberNo, navigate]);

  // 2. 썸머노트 초기화 (boardContent 준비된 후)
  useEffect(() => {
    if (!boardContent) return;

    $('#summernote').summernote({
      height: 300,
        lang: "ko-KR",
 
      callbacks: {
        onChange: function (contents) {
                if (isInitialSet.current) return; // 🔒 첫 설정 이후에만 반영
          setBoardContent(contents);
        },
        onImageUpload: function (files) {
          const formData = new FormData();
          formData.append('image', files[0]);

          fetch("/api/editboard/mytown/uploadImage", {
            method: "POST",
            body: formData
          })
            .then(res => res.text())
            .then(imageUrl => {
              $('#summernote').summernote('insertImage', imageUrl);
              uploadedImagesRef.current.push(imageUrl);
            })
            .catch(err => {
              console.error("이미지 업로드 실패", err);
            });
        }
      },
      toolbar: [
        ['style', ['bold', 'italic', 'underline']],
        ['para', ['ul', 'ol']],
        ['insert', ['link', 'picture']],
        ['misc', ['undo', 'redo']]
      ]
    });

    $('#summernote').summernote('code', boardContent);
  }, [boardContent]);

  // 3. 수정 요청 처리
  const handleUpdate = async () => {
    const updatedContent = $('#summernote').summernote('code');

  // ✅ 이미지 리스트 생성
  const imageList = uploadedImagesRef.current.map((url, index) => {
    const segments = url.split('/');
    return {
      imagePath: '/' + segments.slice(0, -1).join('/'),
      imageName: segments[segments.length - 1],
      imageOrder: index
    };
  });


    const updatedBoard = {
      boardTitle: boardTitle,
      boardContent: updatedContent,
      starCount: board?.starCount ?? 0,
      postType: board?.postType ?? '',
      memberNo: board?.memberNo ?? loginMemberNo,
      hashtagList: board?.hashtagList ?? [],
          imageList // ✅ 추가!

    };

    try {
      await axios.post(`/api/editboard/mytown/${boardNo}/update`, updatedBoard);
      alert("수정이 완료되었습니다.");
      navigate(`/mytownBoard/${boardNo}`);
    } catch (err) {
      console.error(err);
      alert("수정에 실패했습니다.");
    }
  };

  if (!board) return <p>로딩 중...</p>;

  return (
    <div className="board-update-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>게시글 수정</h2>

      <input
        type="text"
        value={boardTitle}
        onChange={(e) => setBoardTitle(e.target.value)}
        placeholder="제목"
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />

      <div id="summernote"></div>

      <button onClick={handleUpdate} className="submit-btn" style={{ marginTop: '20px' }}>
        수정 완료
      </button>
    </div>
  );
}

export default MytownBoardUpdate;
