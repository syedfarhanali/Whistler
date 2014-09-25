package com.talentica.whistler.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class WhistleGroupJoin {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private int whistleId;
	
	private int groupId;

	public WhistleGroupJoin() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	public WhistleGroupJoin(int whistleId, int groupId) {
		super();
		this.whistleId = whistleId;
		this.groupId = groupId;
	}
	
}
