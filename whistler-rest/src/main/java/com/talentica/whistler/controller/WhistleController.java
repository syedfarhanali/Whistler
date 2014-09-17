package com.talentica.whistler.controller;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WhistleController {

	private final AtomicLong counter = new AtomicLong();

	@RequestMapping("/whistler")
	public String greeting(@RequestParam(value="name", required=false, defaultValue="Whistler") String name) {
		return "Hello Whistler";
	}
}
