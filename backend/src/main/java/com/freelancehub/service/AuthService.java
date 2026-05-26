package com.freelancehub.service;

import com.freelancehub.dao.UserDAO;
import com.freelancehub.model.User;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

@Service
public class AuthService {

    private final UserDAO userDAO;
    private final ConcurrentHashMap<String, User> activeTokens = new ConcurrentHashMap<>();

    public AuthService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    public String authenticate(String username, String password) {
        return userDAO.authenticate(username, password)
                .map(user -> {
                    String token = UUID.randomUUID().toString();
                    activeTokens.put(token, user);
                    return token;
                })
                .orElse(null);
    }

    public User validateToken(String token) {
        return activeTokens.get(token);
    }

    public void invalidateToken(String token) {
        activeTokens.remove(token);
    }
}
