package com.talentica.whistler.entity;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;

import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter @Setter
public class User extends BaseEntity{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1048641129382758695L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String username;
	
	@JsonIgnore
	private String password;
	
	private String firstName;
	
	private String lastName;
	
	@ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.DETACH,
			CascadeType.MERGE, CascadeType.REFRESH })
	@JoinTable(name = "user_clan_join", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "clan_id"))
	private List<Clan> clans;
	
}
