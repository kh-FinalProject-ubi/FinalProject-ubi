package edu.kh.project.common.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/*
 * 스프링 예외 처리 방법 (우선 순위별로 작성)
 * 
 * 1. 메서드에서 직접 처리 (try-catch/throws)
 * 
 * 2. 컨트롤러 클래스에서 클래스 단위로 모아서 처리
 * ( @ExceptionHandler 어노테이션을 지닌 메서드를 작성 )
 * 
 * 3. 별도 클래스를 만들어 프로젝트 단위로 모아서 처리
 * ( @ControllerAdvice 어노테이션을 지닌 클래스를 작성
 * 	해당 클래스 내부에서 @ExceptionHandler 어노테이션 지닌 메서드를 작성 )
 * 
 * */
@RestControllerAdvice 
public class ExceptionController {

	// @ExceptionHandler(예외 종류) : 어떤 예외를 다룰건지 작성
	 /**
     * 404 Not Found
     * 요청한 리소스가 존재하지 않을 때 처리 (예: 잘못된 URL)
     */
    @ExceptionHandler(org.springframework.web.servlet.NoHandlerFoundException.class)
    public ResponseEntity<?> handle404(Exception e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "요청하신 리소스를 찾을 수 없습니다."));
    }

    /**
     * 모든 예외 처리 (fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        e.printStackTrace();  // 서버 콘솔에 로그 출력

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "서버 내부 오류가 발생했습니다.",
                    "detail", e.getMessage()
                ));
    }
}