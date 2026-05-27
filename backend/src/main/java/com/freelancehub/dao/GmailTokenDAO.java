package com.freelancehub.dao;

import com.freelancehub.model.GmailToken;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class GmailTokenDAO {

    private final JdbcTemplate jdbcTemplate;

    public GmailTokenDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        initTable();
    }

    private void initTable() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS gmail_tokens (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "access_token TEXT," +
                "refresh_token TEXT," +
                "token_expiry BIGINT," +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")");
    }

    public Optional<GmailToken> get() {
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(
                    "SELECT * FROM gmail_tokens ORDER BY id DESC LIMIT 1",
                    tokenRowMapper()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void save(GmailToken token) {
        jdbcTemplate.execute("DELETE FROM gmail_tokens");
        jdbcTemplate.update(
                "INSERT INTO gmail_tokens (access_token, refresh_token, token_expiry) VALUES (?, ?, ?)",
                token.getAccessToken(), token.getRefreshToken(), token.getTokenExpiry());
    }

    public void deleteAll() {
        jdbcTemplate.execute("DELETE FROM gmail_tokens");
    }

    private RowMapper<GmailToken> tokenRowMapper() {
        return (rs, rowNum) -> {
            GmailToken t = new GmailToken();
            t.setId(rs.getInt("id"));
            t.setAccessToken(rs.getString("access_token"));
            t.setRefreshToken(rs.getString("refresh_token"));
            t.setTokenExpiry(rs.getLong("token_expiry"));
            return t;
        };
    }
}
