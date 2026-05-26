package com.freelancehub.dao;

import com.freelancehub.model.Project;
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
public class ProjectDAO {

    private final JdbcTemplate jdbcTemplate;

    public ProjectDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Project insert(Project project) {
        String sql = "INSERT INTO projects (client_id, name, description, hourly_rate, status, created_at, updated_at) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, project.getClientId());
            ps.setString(2, project.getName());
            ps.setString(3, project.getDescription());
            ps.setBigDecimal(4, project.getHourlyRate());
            ps.setString(5, project.getStatus());
            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            ps.setTimestamp(6, now);
            ps.setTimestamp(7, now);
            return ps;
        }, keyHolder);
        project.setId(keyHolder.getKey().intValue());
        return project;
    }

    public Optional<Project> getById(int id) {
        try {
            String sql = "SELECT * FROM projects WHERE id = ?";
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, projectRowMapper(), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Project> getAll() {
        String sql = "SELECT * FROM projects ORDER BY name";
        return jdbcTemplate.query(sql, projectRowMapper());
    }

    public List<Project> getByClientId(int clientId) {
        String sql = "SELECT * FROM projects WHERE client_id = ? ORDER BY name";
        return jdbcTemplate.query(sql, projectRowMapper(), clientId);
    }

    public boolean update(Project project) {
        String sql = "UPDATE projects SET client_id = ?, name = ?, description = ?, hourly_rate = ?, "
                + "status = ?, updated_at = ? WHERE id = ?";
        return jdbcTemplate.update(sql, project.getClientId(), project.getName(), project.getDescription(),
                project.getHourlyRate(), project.getStatus(), Timestamp.valueOf(LocalDateTime.now()),
                project.getId()) > 0;
    }

    public boolean delete(int id) {
        String sql = "DELETE FROM projects WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }

    private RowMapper<Project> projectRowMapper() {
        return (rs, rowNum) -> {
            Project p = new Project();
            p.setId(rs.getInt("id"));
            p.setClientId(rs.getInt("client_id"));
            p.setName(rs.getString("name"));
            p.setDescription(rs.getString("description"));
            p.setHourlyRate(rs.getBigDecimal("hourly_rate"));
            p.setStatus(rs.getString("status"));
            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) p.setCreatedAt(createdAt.toLocalDateTime());
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) p.setUpdatedAt(updatedAt.toLocalDateTime());
            return p;
        };
    }
}
