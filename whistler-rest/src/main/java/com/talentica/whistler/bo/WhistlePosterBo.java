package com.talentica.whistler.bo;

import com.talentica.whistler.entity.Vote;
import com.talentica.whistler.entity.WhistleFavJoin;
import com.talentica.whistler.enumeration.VoteType;

public interface WhistlePosterBo {

	WhistleFavJoin addFavWhistle(Integer userId, Integer whistleId);

	Vote addVoteToWhistle(Integer whistleId, Integer userId, VoteType type);

}
