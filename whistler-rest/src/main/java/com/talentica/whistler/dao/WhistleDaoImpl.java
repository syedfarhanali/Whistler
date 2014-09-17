package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.Whistle;

@Repository
public class WhistleDaoImpl extends BaseDaoImpl<Whistle> implements WhistleDao{

	public WhistleDaoImpl() {
		super(Whistle.class);
	}

}
