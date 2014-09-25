package com.talentica.whistler.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class WhistleFavJoin {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private int whistleId;
	
	private int userId;
	
	public WhistleFavJoin() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public WhistleFavJoin(int whistleId, int userId){
		this.whistleId = whistleId;
		this.userId = userId;
	}
}
