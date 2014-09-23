package com.talentica.whistler.bo;

import java.util.List;

import com.talentica.whistler.entity.Whistle;
import com.talentica.whistler.entity.WhistleFavJoin;

public interface WhistleFinderBo {

	List<Whistle> findSharedWhistles(Integer userId, Integer page);
	
	List<Whistle> findMineWhistles(Integer userId, Integer page);

	void save(Whistle whistle);

	Whistle update(Whistle whistle);

	List<Whistle> findFavWhistles(Integer userId, Integer page);

	List<Whistle> findClanWhistles(Integer userId, Integer page);

}
