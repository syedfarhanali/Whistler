package com.talentica.whistler.bean;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ClanDto {

	private Integer value;
	
	private String label;
	
	public ClanDto(Object[] obj) {
		this.value=(Integer )obj[0];
		this.label=(String)obj[1];
	}

	public ClanDto() {
		super();
	}

}
