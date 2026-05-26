package com.freelancehub.dao;

import com.freelancehub.model.Client;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class ClientDAO {

    private final JdbcTemplate jdbcTemplate;

    public ClientDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Client insert(Client client) {
        String sql = "INSERT INTO clients (name, email, phone, company, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, client.getName());
            ps.setString(2, client.getEmail());
            ps.setString(3, client.getPhone());
            ps.setString(4, client.getCompany());
            ps.setString(5, client.getNotes());
            ps.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            return ps;
        }, keyHolder);
        client.setId(keyHolder.getKey().intValue());
        return client;
    }

    public Optional<Client> getById(int id) {
        try {
            String sql = "SELECT * FROM clients WHERE id = ?";
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, clientRowMapper(), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Client> getAll() {
        String sql = "SELECT * FROM clients ORDER BY name";
        return jdbcTemplate.query(sql, clientRowMapper());
    }

    public boolean update(Client client) {
        String sql = "UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, notes = ? WHERE id = ?";
        return jdbcTemplate.update(sql, client.getName(), client.getEmail(), client.getPhone(),
                client.getCompany(), client.getNotes(), client.getId()) > 0;
    }

    public boolean delete(int id) {
        String sql = "DELETE FROM clients WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }

    private RowMapper<Client> clientRowMapper() {
        return (rs, rowNum) -> {
            Client c = new Client();
            c.setId(rs.getInt("id"));
            c.setName(rs.getString("name"));
            c.setEmail(rs.getString("email"));
            c.setPhone(rs.getString("phone"));
            c.setCompany(rs.getString("company"));
            c.setNotes(rs.getString("notes"));
            Timestamp ts = rs.getTimestamp("created_at");
            if (ts != null) c.setCreatedAt(ts.toLocalDateTime());
            return c;
        };
    }
}
