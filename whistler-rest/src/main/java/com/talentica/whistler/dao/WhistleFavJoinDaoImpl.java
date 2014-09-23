package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.WhistleFavJoin;

@Repository
public class WhistleFavJoinDaoImpl extends BaseDaoImpl<WhistleFavJoin> implements WhistleFavJoinDao{

	public WhistleFavJoinDaoImpl() {
		super(WhistleFavJoin.class);
	}
	
}
