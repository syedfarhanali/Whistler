package com.talentica.whistler.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.talentica.whistler.bean.ClanDto;
import com.talentica.whistler.bo.QueryBo;
import com.talentica.whistler.common.SQLQueryIds;
import com.talentica.whistler.common.Util;
import com.talentica.whistler.entity.Clan;

@Repository
public class ClanDaoImpl extends BaseDaoImpl<Clan> implements ClanDao{

	@Autowired
	private QueryBo queryBo;
	
	public ClanDaoImpl() {
		super(Clan.class);
	}

	public List<ClanDto> findMyClans(Integer userId){
		javax.persistence.Query query = entityManager.createNativeQuery(queryBo.getQueryString(SQLQueryIds.FIND_MY_CLANS,new Object[]{userId}));
		return Util.getClansFromList(query.getResultList());
	}
}
