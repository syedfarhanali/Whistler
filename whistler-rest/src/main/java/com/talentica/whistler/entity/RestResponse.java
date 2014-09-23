package com.talentica.whistler.entity;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RestResponse {

	private String status;
	private String message;
	private Object body;
	
	public RestResponse(String status, String message, Object body){
		this.status = status;
		this.message = message;
		this.body = body;
	}
}
