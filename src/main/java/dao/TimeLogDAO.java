package dao;

import db.DBConnection;
import models.TimeLog;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TimeLogDAO {

    public int insert(TimeLog timeLog) throws SQLException {
        String sql = "INSERT INTO time_logs (project_id, date, hours, description, created_at) VALUES (?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, timeLog.getProjectId());
            stmt.setDate(2, Date.valueOf(timeLog.getDate()));
            stmt.setBigDecimal(3, timeLog.getHours());
            stmt.setString(4, timeLog.getDescription());
            stmt.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                timeLog.setId(id);
                return id;
            }
            throw new SQLException("Insert failed, no ID obtained");
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public TimeLog getById(int id) throws SQLException {
        String sql = "SELECT * FROM time_logs WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            }
            return null;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public List<TimeLog> getAll() throws SQLException {
        String sql = "SELECT * FROM time_logs ORDER BY date DESC, id DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            List<TimeLog> logs = new ArrayList<>();
            while (rs.next()) {
                logs.add(mapRow(rs));
            }
            return logs;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public List<TimeLog> getByProjectId(int projectId) throws SQLException {
        String sql = "SELECT * FROM time_logs WHERE project_id = ? ORDER BY date DESC, id DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, projectId);
            rs = stmt.executeQuery();
            List<TimeLog> logs = new ArrayList<>();
            while (rs.next()) {
                logs.add(mapRow(rs));
            }
            return logs;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public boolean update(TimeLog timeLog) throws SQLException {
        String sql = "UPDATE time_logs SET project_id = ?, date = ?, hours = ?, description = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, timeLog.getProjectId());
            stmt.setDate(2, Date.valueOf(timeLog.getDate()));
            stmt.setBigDecimal(3, timeLog.getHours());
            stmt.setString(4, timeLog.getDescription());
            stmt.setInt(5, timeLog.getId());
            return stmt.executeUpdate() > 0;
        } finally {
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM time_logs WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } finally {
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    private TimeLog mapRow(ResultSet rs) throws SQLException {
        TimeLog t = new TimeLog();
        t.setId(rs.getInt("id"));
        t.setProjectId(rs.getInt("project_id"));

        Date d = rs.getDate("date");
        if (d != null) {
            t.setDate(d.toLocalDate());
        }

        t.setHours(rs.getBigDecimal("hours"));
        t.setDescription(rs.getString("description"));

        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            t.setCreatedAt(ts.toLocalDateTime());
        }
        return t;
    }
}
