package com.talentica.whistler.entity;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
public class BaseEntity implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Temporal(value = TemporalType.TIMESTAMP)
	@Getter@Setter
	protected Date created;
	
	@Temporal(value = TemporalType.TIMESTAMP)
	@Getter@Setter
	protected Date lastModified;
	
	@PrePersist
	@PreUpdate
	void setPreDefaultValues(){
		if(created==null){
			created= new Date();
		}
		lastModified= new Date();
	}
}
