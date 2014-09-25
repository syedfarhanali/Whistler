package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.WhistleFavJoin;
import com.talentica.whistler.entity.WhistleUserJoin;

@Repository
public class WhistleUserJoinDaoImpl extends BaseDaoImpl<WhistleUserJoin> implements WhistleUserJoinDao{

	public WhistleUserJoinDaoImpl() {
		super(WhistleUserJoin.class);
	}
	
}
