package edu.kh.project.welfare.detail.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.detail.service.WelfareDetailService;

import java.util.Map;

@RestController
@RequestMapping("/api/welfare")
@RequiredArgsConstructor
@Slf4j // ✅ Slf4j 로그 선언
public class WelfareDetailController {

    private final WelfareDetailService service;

    @GetMapping("/detail")
    public ResponseEntity<?> getDetail(@RequestParam("apiServiceId") String apiServiceId) {


        Welfare detail = service.getDetailByApiServiceId(apiServiceId);

        if (detail == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("message", "해당 복지 데이터를 찾을 수 없습니다."));
        }

        return ResponseEntity.ok(Map.of("detail", detail));
    }
}