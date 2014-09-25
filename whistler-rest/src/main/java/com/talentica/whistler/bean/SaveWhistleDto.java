package com.talentica.whistler.bean;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SaveWhistleDto {

	private Integer userId;
	
	private String title;
	
	private String description;
	
	private String image;
	
	private String url;
	
	private String comment;
	
	private String[] clans;
	
	private Integer[] clanIds;

}
