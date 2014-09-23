package com.talentica.whistler.bo;

import com.talentica.whistler.entity.WhistleFavJoin;

public interface WhistlePosterBo {

	WhistleFavJoin addFavWhistle(Integer userId, Integer whistleId);

}
