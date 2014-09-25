package com.talentica.whistler.entity;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Clan extends BaseEntity{

	/**
	 * 
	 */
	private static final long serialVersionUID = 3233598293764738351L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	
	public Clan(Object[] obj) {
		this.id=new Long((Integer)obj[0]); ;
		this.name=(String )obj[1];
	}
	
}
