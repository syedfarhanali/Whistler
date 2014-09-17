package com.talentica.whistler.entity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

public class Group extends BaseEntity{

	/**
	 * 
	 */
	private static final long serialVersionUID = 3233598293764738351L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
}
