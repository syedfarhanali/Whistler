package com.talentica.whistler.dao;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.bo.QueryBo;
import com.talentica.whistler.common.SQLQueryIds;
import com.talentica.whistler.common.Util;
import com.talentica.whistler.common.WConstants;
import com.talentica.whistler.entity.Whistle;

@Repository
public class WhistleDaoImpl extends BaseDaoImpl<Whistle> implements WhistleDao{

	public WhistleDaoImpl() {
		super(Whistle.class);
	}
	
	@Autowired
	private QueryBo queryBo;

	@Override
	public List<WhistleDto> findSharedWhistles(Integer userId, Integer page) {
		int start = (page-1)*WConstants.WHISTLE_PAGE_SIZE; 
		javax.persistence.Query query = entityManager.createNativeQuery(
				queryBo.getQueryString(SQLQueryIds.FIND_SHARED_WHISTLES, new Object[]{start, WConstants.WHISTLE_PAGE_SIZE}))
				.setParameter("userId", userId);
		
		return Util.getWhistlesFromList(query.getResultList());
	}
	
	@Override
	public List<WhistleDto> findMineWhistles(Integer userId, Integer page) {
		int start = (page-1)*WConstants.WHISTLE_PAGE_SIZE;
		javax.persistence.Query query = entityManager.createNativeQuery(
				queryBo.getQueryString(SQLQueryIds.FIND_MINE_WHISTLES, new Object[]{start, WConstants.WHISTLE_PAGE_SIZE}))
				.setParameter("userId", userId);
		return Util.getWhistlesFromList(query.getResultList());
	}

	@Override
	public List<WhistleDto> findFavWhistles(Integer userId, Integer page) {
		int start = (page-1)*WConstants.WHISTLE_PAGE_SIZE;
		javax.persistence.Query query = entityManager.createNativeQuery(
				queryBo.getQueryString(SQLQueryIds.FIND_FAV_WHISTLES, new Object[]{start, WConstants.WHISTLE_PAGE_SIZE}))
				.setParameter("userId", userId);
		return Util.getWhistlesFromList(query.getResultList());
	}

	@Override
	public List<WhistleDto> findClanWhistles(Integer clanId, Integer page) {
		int start = (page-1)*WConstants.WHISTLE_PAGE_SIZE;
		javax.persistence.Query query = entityManager.createNativeQuery(
				queryBo.getQueryString(SQLQueryIds.FIND_CLAN_WHISTLES, new Object[]{start, WConstants.WHISTLE_PAGE_SIZE}))
				.setParameter("clanId", clanId);
		return Util.getWhistlesFromList(query.getResultList());
	}
}
