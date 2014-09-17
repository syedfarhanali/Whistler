package com.talentica.whistler.bo;

import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;

import lombok.extern.log4j.Log4j;

import org.springframework.beans.factory.annotation.Autowired;

import com.talentica.whistler.common.Util;

@Log4j
public class QueryBoImpl implements QueryBo{

	private static final char placeHolder = '?';
	private Map<String, String> map;

	@Autowired
	private Util util;

	/**
	 * @return the map
	 */
	public Map<String, String> getMap() {
		return map;
	}
	/**
	 * @param map the map to set
	 */
	public void setMap(Map<String, String> map) {
		this.map = map;
	}
	
	public String getQueryString(String queryId){
		String query = (String) map.get(queryId);
		return query;
	}

	public String getQueryString(String queryId, Object[] args){
		String query = (String) map.get(queryId);
		return makeQueryString(query, args);
	}

	@Override
	public String makeQueryString(String query, Object[] args){
		int placeHolderCount=  util.occurance(query, placeHolder);
		if(args == null){
			if(placeHolderCount == 0){
				return query;
			}else {
				throw new RuntimeException("Total no of value placeholders [ ? ] should be equal to no of arguments provided");
			}
		}
		else{
			int argsCount = args.length;
			if(argsCount != placeHolderCount){
				log.info("Argument count: "+argsCount+" placeholder count: "+placeHolderCount);
				throw new RuntimeException("Total no of value placeholders [ ? ] should be equal to no of arguments provided");
			}
			String[] strArgs =processArgumentsForSQL(args);
			log.debug("Printing query args");
			for(int i=0; i<strArgs.length; i++){
				log.debug(strArgs[i]);
			}
			int valueIndex=0;
			int valueAnchor=-1;
			StringBuilder tempQuery= new StringBuilder();
			int start=0;
			while(valueIndex<argsCount){
				valueAnchor = query.indexOf(placeHolder, start);
				tempQuery.append(query.substring(start,valueAnchor));
				if(strArgs[valueIndex]!=null){
					tempQuery.append(strArgs[valueIndex]);
				}else{
					if(Collection.class.isAssignableFrom(args[valueIndex].getClass())){
						tempQuery.append("('')");
					}else{
						tempQuery.append("''");
					}
				}
				valueIndex++;
				start=valueAnchor+1;
			}
			tempQuery.append(query.substring(start));
			log.debug("Query String : " + tempQuery.toString());
			return tempQuery.toString();
		}
	}

	public String[] processArgumentsForSQL(Object ... args){
		int argLenth =args.length;
		String[] result = new String[argLenth];

		for(int i=0;i<argLenth;i++){
//			System.out.println("args class : " + args[i].getClass());
			if(args[i]==null){
				result[i]=null;
			}else if(int.class.isAssignableFrom(args[i].getClass())||Integer.class.isAssignableFrom(args[i].getClass())){
				Integer element = (Integer)args[i];
				result[i]=element.toString();
			}else if(Date.class.isAssignableFrom(args[i].getClass())){
				Date element = (Date)args[i];
				result[i]=element.toString();
			}else if(String.class.isAssignableFrom(args[i].getClass())){
				String element = (String)args[i];
				result[i]=quote(element);
			}else if(Collection.class.isAssignableFrom(args[i].getClass())){
				Collection element = (Collection)args[i];
				if(util.nullOrEmpty(element)) {
					result[i]=null;
				}else{
					result[i]=concatForSQL(element);
				}
			}else{
				log.error("Invalid case");
				result[i]=null;
			}
		}
		return result;
	}

	private String quote(String element) {
		return "'"+element+"'";
	}


	private String concatForSQL(Collection col){
		Iterator itr  = col.iterator();
		Object element = itr.next();
		Class type;
		if(null!=element){
			if(int.class.isAssignableFrom(element.getClass())||Integer.class.isAssignableFrom(element.getClass())){
				type= Integer.class;
			}else if(String.class.isAssignableFrom(element.getClass())){
				type= String.class;
			}else{
				return null;
			}
		}else{
			return null;
		}
		StringBuilder sb = new StringBuilder();
		sb.append("(");
		Iterator iterator  = col.iterator();
		while(iterator.hasNext()){
			if(String.class.equals(type)){
				sb.append(quote((String)iterator.next()));
			}
			if(Integer.class.equals(type)){
				sb.append(iterator.next());
			}
			sb.append(",");
		}
		sb.append(")");
		sb.deleteCharAt(sb.length()-2);
		return sb.toString(); 
	}
}
