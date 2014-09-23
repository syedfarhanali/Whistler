package com.talentica.whistler.bo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.talentica.whistler.dao.WhistleFavJoinDao;
import com.talentica.whistler.entity.WhistleFavJoin;

@Service
public class WhistlePosterBoImpl implements WhistlePosterBo{

	@Autowired
	WhistleFavJoinDao whistleFavJoinDao;
	
	@Override
	@Transactional(readOnly=true)
	public WhistleFavJoin addFavWhistle(Integer userId, Integer whistleId) {
		WhistleFavJoin favJoin = new WhistleFavJoin(whistleId, userId);
		return whistleFavJoinDao.update(favJoin);
	}
}
