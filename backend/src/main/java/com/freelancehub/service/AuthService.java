package com.freelancehub.service;

import com.freelancehub.dao.UserDAO;
import com.freelancehub.model.User;
import com.freelancehub.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserDAO userDAO;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder;

    public AuthService(UserDAO userDAO, JwtUtil jwtUtil) {
        this.userDAO = userDAO;
        this.jwtUtil = jwtUtil;
        this.encoder = new BCryptPasswordEncoder();
    }

    public String authenticate(String username, String password) {
        return userDAO.findByUsername(username)
                .filter(user -> {
                    String hash = user.getPasswordHash();
                    if (hash == null) return false;
                    if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
                        return encoder.matches(password, hash);
                    }
                    boolean match = password.equals(hash);
                    if (match) {
                        user.setPasswordHash(encoder.encode(password));
                        userDAO.updatePassword(user);
                    }
                    return match;
                })
                .map(jwtUtil::generateToken)
                .orElse(null);
    }

    public User register(String username, String password) {
        if (userDAO.findByUsername(username).isPresent()) {
            return null;
        }
        User user = new User(username, encoder.encode(password), "user");
        return userDAO.save(user);
    }
}
