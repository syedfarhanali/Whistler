package com.talentica.whistler.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.talentica.whistler.bo.LoginBo;
import com.talentica.whistler.entity.RestResponse;

@RestController
@RequestMapping("/login")
public class LoginController {

	@Autowired
	private LoginBo loginBo;
	
	@RequestMapping(method = RequestMethod.POST)
	public @ResponseBody RestResponse login(@RequestParam("username") String username, @RequestParam("password") String password){
		return loginBo.validateLogin(username, password);
	}
}
