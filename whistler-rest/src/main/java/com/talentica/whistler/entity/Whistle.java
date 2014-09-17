package com.talentica.whistler.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Whistle extends BaseEntity{

	/**
	 * 
	 */
	private static final long serialVersionUID = 2501303191179634409L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String title;
	
	private String description;
	
	private String imageUrl;
	
	private String url;
	
	private int upVote;
	
	private int downVote;
	
}
