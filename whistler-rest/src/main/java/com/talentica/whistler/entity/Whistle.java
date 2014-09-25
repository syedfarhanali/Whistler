package com.talentica.whistler.entity;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

import com.talentica.whistler.bean.SaveWhistleDto;

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
	
	public Whistle(SaveWhistleDto dto){
		this.created=new Date();
		this.title=dto.getTitle();
		this.description=dto.getDescription();
		this.imageUrl=dto.getImage();
		this.url=dto.getUrl();
	}

	public Whistle() {
		super();
		// TODO Auto-generated constructor stub
	}
}
