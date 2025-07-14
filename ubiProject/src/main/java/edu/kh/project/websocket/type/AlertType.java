package edu.kh.project.websocket.type;

public enum AlertType {

	NOTICE("📢", "공지 등록"), // 공지 등록
	REPLY("📬", "문의 답변"), // 문의 답변
	COMMENT("💬", "댓글 등록"), // 댓글 등록
	DEADLINE("⏰", "마감 임박"), // 마감 임박
	API_UPDATE("🔄", "데이터 업데이트"), // 공공 API 데이터 업데이트
	INQUIRY_REPLY("📮", "문의 답변 등록");

	// Enum(열거형)은 프로그래밍에서 특정 값 집합을 제한된 범위 내에서 정의하고 관리하는 데 사용되는 자료형입니다. 주로 상수들의 집합을
	// 표현할 때 유용하며, 코드의 가독성, 유지보수성, 그리고 안정성을 높이는 데 기여합니다. Enum은 단순히 정수 값을 사용하는 것보다 더
	// 안전하고 유연한 방식으로 상수들을 다룰 수 있게 해줍니다.

	/*
	 * Enum의 주요 기능: 상수 값 관리: Enum은 미리 정의된 상수 값들의 집합을 표현합니다. 예를 들어, 요일, 색상, 방향 등과 같이
	 * 제한된 범위 내의 값들을 정의할 때 유용합니다.
	 * 
	 * 타입 안정성: Enum은 특정 타입으로 제한되므로, 잘못된 값이 할당되는 것을 방지합니다. 이는 런타임 오류를 줄이고 코드의 안정성을
	 * 높이는 데 도움이 됩니다.
	 * 
	 * 가독성 향상: Enum은 명확한 이름으로 상수 값들을 표현하므로,코드의 가독성을 높여줍니다. 예를 들어, RED 대신 Color.RED 와
	 * 같이 사용하면 코드의 의미를 쉽게 파악할 수 있습니다.
	 * 
	 * 유지보수 용이성: Enum은 상수 값을 변경해야 할 경우, Enum 정의 부분만 수정하면 되므로 유지보수가 용이합니다. Enum을 사용하지
	 * 않고 상수 값을 직접 사용하는 경우, 코드 전체에서 해당 값을 찾아 수정해야 하는 번거로움이 있습니다.
	 * 
	 * 메서드 추가: Enum은 일반 클래스처럼 메서드를 정의할 수 있습니다. 이를 통해 각 상수 값에 대한 추가적인 기능을 구현할 수 있습니다.
	 * 예 를 들어, 각 요일에 대한 근무 시간을 계산하는 메서드를 추가할 수 있습니다.
	 * 
	 * switch 문 활용: Enum은 switch 문과 함께 사용하여 다양한 로직을 구현할 수 있습니다. Enum의 각 상수 값에 따라 다른
	 * 동작을 수행하도록 구현할 수 있습니다.
	 */

	private final String icon;
	private final String label;

	AlertType(String icon, String label) {
		this.icon = icon;
		this.label = label;
	}

	public String getIcon() {
		return icon;
	}

	public String getLabel() {
		return label;
	}

}
