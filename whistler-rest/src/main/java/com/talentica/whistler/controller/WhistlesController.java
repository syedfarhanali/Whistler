package com.talentica.whistler.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.talentica.whistler.bo.WhistleFinderBo;
import com.talentica.whistler.common.Util;
import com.talentica.whistler.common.WConstants;
import com.talentica.whistler.entity.RestResponse;
import com.talentica.whistler.entity.Whistle;

@RestController
@RequestMapping("/whistle")
public class WhistlesController {

	@Autowired
	private WhistleFinderBo whistleBo;
	
	@RequestMapping(value = "shared/{userId}/{page}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findSharedWhistles(@PathVariable("userId") Integer userId, @PathVariable("page") Integer page){
		List<Whistle> whistles = whistleBo.findSharedWhistles(userId, page);
		RestResponse response = null;
		if(Util.notNullAndEmpty(whistles)){
			response = new RestResponse(WConstants.SUCCESS, null, whistles); 
		}else{
			response = new RestResponse(WConstants.FAILURE, "No Whistles Found!!!", null);
		}
		return response;
	}
	
	@RequestMapping(value = "mine/{userId}/{page}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findMeWhistles(@PathVariable("userId") Integer userId, @PathVariable("page") Integer page){
		List<Whistle> whistles = whistleBo.findMineWhistles(userId, page);
		RestResponse response = null;
		if(Util.notNullAndEmpty(whistles)){
			response = new RestResponse(WConstants.SUCCESS, null, whistles); 
		}else{
			response = new RestResponse(WConstants.FAILURE, "No Whistles Found!!!", null);
		}
		return response;
	}
	
	@RequestMapping(value = "fav/{userId}/{page}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findFavWhistles(@PathVariable("userId") Integer userId, @PathVariable("page") Integer page){
		List<Whistle> whistles = whistleBo.findFavWhistles(userId, page);
		RestResponse response = null;
		if(Util.notNullAndEmpty(whistles)){
			response = new RestResponse(WConstants.SUCCESS, null, whistles); 
		}else{
			response = new RestResponse(WConstants.FAILURE, "No Whistles Found!!!", null);
		}
		return response;
	}
	
	@RequestMapping(value = "clan/{clanId}/{page}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findClanWhistles(@PathVariable("clanId") Integer clanId, @PathVariable("page") Integer page){
		List<Whistle> whistles = whistleBo.findClanWhistles(clanId, page);
		RestResponse response = null;
		if(Util.notNullAndEmpty(whistles)){
			response = new RestResponse(WConstants.SUCCESS, null, whistles); 
		}else{
			response = new RestResponse(WConstants.FAILURE, "No Whistles Found!!!", null);
		}
		return response;
	}
}
