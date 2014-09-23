package com.talentica.whistler.bo;

import java.util.List;

import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.entity.Whistle;
import com.talentica.whistler.entity.WhistleFavJoin;

public interface WhistleFinderBo {

	List<WhistleDto> findSharedWhistles(Integer userId, Integer page);
	
	List<WhistleDto> findMineWhistles(Integer userId, Integer page);

	void save(Whistle whistle);

	Whistle update(Whistle whistle);

	List<WhistleDto> findFavWhistles(Integer userId, Integer page);

	List<WhistleDto> findClanWhistles(Integer userId, Integer page);

}
