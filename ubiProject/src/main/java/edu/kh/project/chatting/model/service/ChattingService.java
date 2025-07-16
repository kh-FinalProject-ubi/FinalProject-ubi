package edu.kh.project.chatting.model.service;

import java.util.List;
import java.util.Map;

import edu.kh.project.chatting.model.dto.ChattingRoom;
import edu.kh.project.chatting.model.dto.Message;
import edu.kh.project.member.model.dto.Member;

public interface ChattingService {
	
	/** 채팅방 목록 조회
	 * @param memberNo
	 * @return roomList
	 */
	List<ChattingRoom> selectRoomList(int memberNo);

    /** 채팅방번호 체크
     * @param map
     * @return chattingNo
     */
    int checkChattingRoomNo(Map<String, Integer> map);

    /** 새로운 채팅방 생성
     * @param map
     * @return chattingNo
     */
    int createChattingRoom(Map<String, Integer> map);

    /** 읽음 표시 업데이트
     * @param chatRoomNo
     * @return
     */
    int updateReadFlag(int chatRoomNo);

    /** 메세지 조회
     * @param paramMap
     * @return
     */
    List<Message> selectMessageList(Map<String, Integer> map);

	/** 채팅 상대 검색
	 * @param map 
	 * @return memberList
	 */
	List<Member> selectTarget(Map<String, Object> map);
	
	/** 채팅 입력
     * @param msg
     * @return
     */
    int insertMessage(Message msg);

	/** 채팅방 나가기
	 * @param map
	 * @return
	 */
	int exitChatRoom(Map<String, Integer> map);

	/** 채팅 삭제
	 * @param map
	 * @return
	 */
	int deleteMessage(Map<String, Integer> map);


}
