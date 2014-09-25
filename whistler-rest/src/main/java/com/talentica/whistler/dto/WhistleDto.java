package com.talentica.whistler.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class WhistleDto {

	private Long id;
	
	private String title;
	
	private String description;
	
	private String imageUrl;
	
	private String url;
	
	private Integer[] clanIds;
	
	private Integer mineUserId;
}
