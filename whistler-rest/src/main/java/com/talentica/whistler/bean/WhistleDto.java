package com.talentica.whistler.bean;

import java.util.Date;

import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class WhistleDto {

	private Integer id;
	
	private String title;
	
	private String description;
	
	private String image;
	
	private String url;
	
	private Date created;
	
	private Date lastModified;
	
	public WhistleDto(Object[] obj) {
		this.id=(Integer)obj[0];
		this.title=(String )obj[1];
		this.description=(String)obj[2];
		this.image=(String)obj[3];
		this.url=(String)obj[4];
		this.created=(Date)obj[5];
		this.lastModified=(Date)obj[6];
	}

	public WhistleDto() {
		super();
	}

}
