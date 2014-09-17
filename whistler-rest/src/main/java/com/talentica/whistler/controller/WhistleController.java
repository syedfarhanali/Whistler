package com.talentica.whistler.controller;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WhistleController {

	private static final String template = "Hello, %s!";
	private final AtomicLong counter = new AtomicLong();

	@RequestMapping("/whistler")
	public Greeting greeting(@RequestParam(value="name", required=false, defaultValue="Whistler") String name) {
		return new Greeting(counter.incrementAndGet(),
				String.format(template, name));
	}
}
