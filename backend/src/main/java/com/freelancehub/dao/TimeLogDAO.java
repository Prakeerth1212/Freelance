package com.freelancehub.dao;

import com.freelancehub.model.TimeLog;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class TimeLogDAO {

    private final JdbcTemplate jdbcTemplate;

    public TimeLogDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public TimeLog insert(TimeLog timeLog) {
        String sql = "INSERT INTO time_logs (project_id, date, hours, description, created_at) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, timeLog.getProjectId());
            ps.setDate(2, Date.valueOf(timeLog.getDate()));
            ps.setBigDecimal(3, timeLog.getHours());
            ps.setString(4, timeLog.getDescription());
            ps.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            return ps;
        }, keyHolder);
        timeLog.setId(keyHolder.getKey().intValue());
        return timeLog;
    }

    public Optional<TimeLog> getById(int id) {
        try {
            String sql = "SELECT * FROM time_logs WHERE id = ?";
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, timeLogRowMapper(), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<TimeLog> getAll() {
        String sql = "SELECT * FROM time_logs ORDER BY date DESC, id DESC";
        return jdbcTemplate.query(sql, timeLogRowMapper());
    }

    public List<TimeLog> getByProjectId(int projectId) {
        String sql = "SELECT * FROM time_logs WHERE project_id = ? ORDER BY date DESC, id DESC";
        return jdbcTemplate.query(sql, timeLogRowMapper(), projectId);
    }

    public boolean update(TimeLog timeLog) {
        String sql = "UPDATE time_logs SET project_id = ?, date = ?, hours = ?, description = ? WHERE id = ?";
        return jdbcTemplate.update(sql, timeLog.getProjectId(), Date.valueOf(timeLog.getDate()),
                timeLog.getHours(), timeLog.getDescription(), timeLog.getId()) > 0;
    }

    public boolean delete(int id) {
        String sql = "DELETE FROM time_logs WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }

    private RowMapper<TimeLog> timeLogRowMapper() {
        return (rs, rowNum) -> {
            TimeLog t = new TimeLog();
            t.setId(rs.getInt("id"));
            t.setProjectId(rs.getInt("project_id"));
            Date d = rs.getDate("date");
            if (d != null) t.setDate(d.toLocalDate());
            t.setHours(rs.getBigDecimal("hours"));
            t.setDescription(rs.getString("description"));
            Timestamp ts = rs.getTimestamp("created_at");
            if (ts != null) t.setCreatedAt(ts.toLocalDateTime());
            return t;
        };
    }
}
