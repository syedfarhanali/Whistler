package com.talentica.whistler.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.talentica.whistler.bo.ClanBo;
import com.talentica.whistler.common.Util;
import com.talentica.whistler.common.WConstants;
import com.talentica.whistler.entity.Clan;
import com.talentica.whistler.entity.RestResponse;

@RestController
@RequestMapping("/clan")
public class ClanController {

	@Autowired
	private ClanBo clanBo;
	
	@RequestMapping(value = "all/{userId}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findAllClans(@PathVariable("userId") Integer userId){
		return null;
	}
	
	@RequestMapping(value = "notmy/{userId}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findNotMyClans(@PathVariable("userId") Integer userId){
		return null;
	}
	
	@RequestMapping(value = "my/{userId}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findMyClans(@PathVariable("userId") Integer userId){
		List<Clan> clans = clanBo.findMyClans(userId);
		RestResponse response = null;
		if(Util.notNullAndEmpty(clans)){
			response = new RestResponse(WConstants.SUCCESS, null, clans); 
		}else{
			response = new RestResponse(WConstants.FAILURE, "No Whistles Found!!!", null);
		}
		return response;
	}
	
	@RequestMapping(value = "{clanId}", method = RequestMethod.GET)
	public @ResponseBody RestResponse findClanById(@PathVariable("clanId") Integer clanId){
		return null;
	}
	
	
}
