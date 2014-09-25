package com.talentica.whistler.bo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.talentica.whistler.dao.VoteDao;
import com.talentica.whistler.dao.WhistleFavJoinDao;
import com.talentica.whistler.entity.Vote;
import com.talentica.whistler.entity.WhistleFavJoin;
import com.talentica.whistler.enumeration.VoteType;

@Service
public class WhistlePosterBoImpl implements WhistlePosterBo{

	@Autowired
	WhistleFavJoinDao whistleFavJoinDao;
	
	@Autowired
	VoteDao voteDao;
	
	@Override
	@Transactional
	public WhistleFavJoin addFavWhistle(Integer userId, Integer whistleId) {
		if(null==userId || null==whistleId){
			return null;
		}
		WhistleFavJoin favJoin = new WhistleFavJoin(whistleId, userId);
		return whistleFavJoinDao.update(favJoin);
	}

	@Override
	@Transactional
	public Vote addVoteToWhistle(Integer whistleId, Integer userId, VoteType type) {
		if(null==userId || null==whistleId || null==type){
			return null;
		}
		Vote vote = new Vote(type, userId, whistleId);
		return voteDao.update(vote);
	}
}
