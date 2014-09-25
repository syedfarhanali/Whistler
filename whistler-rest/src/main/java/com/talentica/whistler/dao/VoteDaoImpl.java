package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.Vote;

@Repository
public class VoteDaoImpl extends BaseDaoImpl<Vote> implements VoteDao{

	public VoteDaoImpl() {
		super(Vote.class);
	}

}
