package com.talentica.whistler.dao;

import java.util.List;

import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.entity.Whistle;

public interface WhistleDao extends BaseDao<Whistle>{

	List<WhistleDto> findSharedWhistles(Integer userId, Integer page);
	
	List<WhistleDto> findMineWhistles(Integer userId, Integer page);

	List<WhistleDto> findFavWhistles(Integer userId, Integer page);

	List<WhistleDto> findClanWhistles(Integer clanId, Integer page);
}
