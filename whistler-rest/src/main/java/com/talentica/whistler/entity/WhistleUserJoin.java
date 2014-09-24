package com.talentica.whistler.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class WhistleUserJoin {
	
	public WhistleUserJoin(){}
	
	public WhistleUserJoin(int whistleId, int userId){
		this.whistleId = whistleId;
		this.userId = userId;
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private int whistleId;
	
	private int userId;
	
}
