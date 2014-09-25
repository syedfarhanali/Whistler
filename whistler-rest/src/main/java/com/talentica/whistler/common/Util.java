package com.talentica.whistler.common;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Component;

import com.talentica.whistler.bean.WhistleDto;
import com.talentica.whistler.entity.Clan;

@Component
public class Util {

	public int occurance(String string, char c) {
		int count = 0;
		if(Util.notNullAndEmpty(string)) {
			for (int i = 0; i < string.length(); i++) {
				if (string.charAt(i) == c) {
					count++;
				}
			}
		}
		return count;
	}
	
	public static boolean notNullAndEmpty(Collection<?> collection) {
		return collection != null && !collection.isEmpty();
	}

	public static boolean nullOrEmpty(Collection<?> collection) {
		return collection == null || collection.isEmpty();
	}
	public static boolean nullOrEmpty(Object[] array) {
		return array==null || array.length==0;
	}

	public static boolean nullOrEmpty(String str) {
		return null == str || "".equals(str.trim());
	}

	public static boolean notNullAndEmpty(String str) {
		return !(null == str || "".equals(str.trim()));
	}
	
	public static List<WhistleDto> getWhistlesFromList(List<Object[]> list){
		List<WhistleDto> whistles = new ArrayList<WhistleDto>();
		for(Object[] obj : list){
			WhistleDto dto = new WhistleDto(obj);
			whistles.add(dto);
		}
		return whistles;
	}
	
	public static List<Clan> getClansFromList(List<Object[]> list){
		List<Clan> clans = new ArrayList<Clan>();
		for(Object[] obj : list){
			Clan dto = new Clan(obj);
			clans.add(dto);
		}
		return clans;
	}
	
}
