package com.talentica.whistler.dao;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.sql.DataSource;

import lombok.extern.log4j.Log4j;

import org.hibernate.Session;
import org.springframework.transaction.annotation.Transactional;

@Log4j
public abstract class BaseDaoImpl<T>  implements BaseDao<T>{
	
	protected Class<T> type;
	
	@PersistenceContext
	protected EntityManager entityManager;
	
	public BaseDaoImpl(Class<T> type) {
		super();
		this.type = type;
	}
	
	public BaseDaoImpl(Class<T> type, DataSource dataSource) {
		super();
		this.type = type;
	}
	
	protected Session getCurrentSession(){
		return entityManager.unwrap(Session.class);
	}

	@Transactional
	public T update(T entity) {
		return entityManager.merge(entity);
	}
	
	@Transactional
	public void save(Collection<T> entities){
		for(T entity : entities){
			this.save(entity);
		}
	}
	
	@Transactional
	public void save(T entity) {
		entityManager.persist(entity);
	}
	
	@Transactional
	public void remove(T entity) {
		entityManager.remove(entity);
	}
			
	@Override
	@Transactional(readOnly=true)
	public T findById(int entityId) {
		return (T) entityManager.find(type, entityId);
	}

	@Transactional(readOnly=true)
	public T load(Object id) {
		if (id == null) {
			return null;
		} else {
			return entityManager.find(type, id);
		}
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<T> findAll() {
		return entityManager.createQuery("select o from " + type.getName() + " o").getResultList();
	}
	
	@SuppressWarnings("unchecked")
	public List<T> findPaginatedResults(String queryStr, int currentPage, int pageSize ){
		return entityManager.createQuery((String) queryStr).setFirstResult((currentPage-1) * pageSize)
				.setMaxResults(pageSize).getResultList();
	}
	
	
	@SuppressWarnings("unchecked")
	public List<T> findParamsPaginatedResults(String queryStr, Object[] params,int currentPage, int pageSize ){
		Query query = entityManager.createQuery(queryStr);
		int count =0;
		for(Object param: params){
			query.setParameter(count++, param);
		}
		return query.setFirstResult((currentPage-1) * pageSize).setMaxResults(pageSize).getResultList();
	}
	
	@SuppressWarnings("unchecked")
	public List<T> findParamsPaginatedResults(String queryStr, Map<String, Object> params,int currentPage, int pageSize ){
		Query query = entityManager.createQuery(queryStr);
		Iterator<Entry<String, Object>> itr= params.entrySet().iterator();
		while (itr.hasNext()) {
			Entry<String, Object> entry = itr.next();
			query.setParameter(entry.getKey(), entry.getValue());
		}
		return query.setFirstResult((currentPage-1) * pageSize).setMaxResults(pageSize).getResultList();
	}
	
	@SuppressWarnings("unchecked")
	public List<T> getResults(String queryStr){
		return entityManager.createQuery(queryStr).getResultList();
	}
	
	public void refresh(T object) {
		entityManager.refresh(object);
	}
	
	@Override
	public void flush() {
		entityManager.flush();
	}
	
	@Override
	public void clearEntityManager() {
		entityManager.clear();
	}
	
	@SuppressWarnings("unchecked")
	@Transactional 
	public <V> List<V> getSQLQueryResult(String query, Class<V> klass){
		List<V> list = entityManager.createNativeQuery(query,klass).getResultList();
		return list;
	}
	
	@Override
	public Object getSQLQueryResult(String query){
		return entityManager.createNativeQuery(query).getResultList();
	}
	
	@Override
	public List<T> findAllWithJoin(String property){
		return entityManager.createQuery("select o from " + type.getName() + " o inner join fetch o." + property).getResultList();
	}
}
