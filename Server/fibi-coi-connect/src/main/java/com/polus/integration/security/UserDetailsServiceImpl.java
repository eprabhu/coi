package com.polus.integration.security;

import static java.util.Collections.emptyList;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.polus.integration.pojo.Person;
import com.polus.integration.repository.ApplicationUserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

	@Autowired
	private ApplicationUserRepository applicationUserRepository;

	public UserDetailsServiceImpl(ApplicationUserRepository applicationUserRepository) {
		this.applicationUserRepository = applicationUserRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Person person = applicationUserRepository.findByPrincipalName(username);
		if (person == null) {
			throw new UsernameNotFoundException(username);
		}
		String encryptedPWD = "{noop}" + person.getPassword();
		return new User(person.getPrincipalName(), encryptedPWD, emptyList());
		// return new User(principal.getPrincipalName(), principal.getPassword(),
		// getAuthorities(principal.getPrincipalName()));
	}

	public Collection<? extends GrantedAuthority> getAuthorities(String personId) {
		List<GrantedAuthority> list = new ArrayList<GrantedAuthority>();
		// loginDao.isUnitAdmin(personId);
		list.add(new SimpleGrantedAuthority("ADMIN"));
		list.add(new SimpleGrantedAuthority("UNIT_ADMIN"));

		return list;
	}

}
