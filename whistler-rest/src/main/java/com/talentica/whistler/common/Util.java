package com.talentica.whistler.common;

import java.util.Collection;

import org.springframework.stereotype.Component;

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

	public static boolean nullOrEmpty(String str) {
		return null == str || "".equals(str.trim());
	}

	public static boolean notNullAndEmpty(String str) {
		return !(null == str || "".equals(str.trim()));
	}
}
