package edu.kh.project.error;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        e.printStackTrace(); // 디버깅
        return ResponseEntity.status(500).body(Map.of(
            "message", "서버에서 오류가 발생했습니다.",
            "detail", e.getMessage()
        ));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<?> handle404(NoHandlerFoundException e) {
        return ResponseEntity.status(404).body(Map.of(
            "message", "요청하신 경로를 찾을 수 없습니다."
        ));
    }
}