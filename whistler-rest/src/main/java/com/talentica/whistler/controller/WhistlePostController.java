package com.talentica.whistler.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.talentica.whistler.bo.WhistlePosterBo;
import com.talentica.whistler.common.WConstants;
import com.talentica.whistler.entity.RestResponse;
import com.talentica.whistler.entity.WhistleFavJoin;

@RestController
public class WhistlePostController {

	@Autowired
	private WhistlePosterBo whistlePosterBo;
	
	@RequestMapping(value = "fav/{userId}/{whistleId}", method = RequestMethod.POST)
	public @ResponseBody RestResponse postWhistle(@PathVariable("userId") Integer userId, @PathVariable("whistleId") Integer whistleId){
		RestResponse response = null;
		WhistleFavJoin favJoin = whistlePosterBo.addFavWhistle(whistleId, userId);
		if(null!=favJoin){
			response = new RestResponse(WConstants.SUCCESS, null, favJoin);
		}else{
			response = new RestResponse(WConstants.FAILURE, "Whistle Failure", null);
		}
		return response;
	}
	
}
