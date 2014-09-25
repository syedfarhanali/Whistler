package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.WhistleGroupJoin;

@Repository
public class WhistleClanJoinDaoImpl extends BaseDaoImpl<WhistleGroupJoin> implements WhistleClanJoinDao{

	public WhistleClanJoinDaoImpl() {
		super(WhistleGroupJoin.class);
	}
	
}
