package com.talentica.whistler.dao;

import org.springframework.stereotype.Repository;

import com.talentica.whistler.entity.Clan;

@Repository
public class ClanDaoImpl extends BaseDaoImpl<Clan> implements ClanDao{

	public ClanDaoImpl() {
		super(Clan.class);
	}

}
