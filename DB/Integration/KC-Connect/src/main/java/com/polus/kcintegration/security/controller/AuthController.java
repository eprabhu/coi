package com.polus.kcintegration.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.polus.kcintegration.constant.Constant;
import com.polus.kcintegration.security.vo.AuthResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

	@PostMapping("/generateUserDetails")
	public ResponseEntity<?> generateUserDetails(HttpServletRequest req, HttpServletResponse res) {
		log.info("Requesting for generateUserDetails...");
		return ResponseEntity.ok(new AuthResponse(res.getHeader(Constant.HEADER_STRING)));
	}

}
