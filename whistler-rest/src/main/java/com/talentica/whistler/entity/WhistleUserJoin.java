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
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private int whistleId;
	
	private int userId;
	
	public WhistleUserJoin() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public WhistleUserJoin(int whistleId, int userId){
		this.whistleId = whistleId;
		this.userId = userId;
	}
}
