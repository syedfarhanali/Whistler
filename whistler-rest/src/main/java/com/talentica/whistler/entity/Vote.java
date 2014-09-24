package com.talentica.whistler.entity;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

import com.talentica.whistler.enumeration.VoteType;

@Entity
@Getter @Setter
public class Vote {
	
	public Vote(){}
	
	public Vote(VoteType type, int userId, int whistleId){
		this.type = type;
		this.userId = userId;
		this.whistleId = whistleId;
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Enumerated(EnumType.STRING)
	private VoteType type;
	
	private int userId;
	
	private int whistleId;
}
