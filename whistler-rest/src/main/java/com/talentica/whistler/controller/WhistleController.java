package com.talentica.whistler.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/whistles")
public class WhistleController {
	
	
	public String findWhistles(@RequestParam(value="name", required=false, defaultValue="Whistler") String name) {
		return "Hello Whistler";
	}
}
