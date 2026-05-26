package dao;

import db.DBConnection;
import models.Project;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProjectDAO {

    public int insert(Project project) throws SQLException {
        String sql = "INSERT INTO projects (client_id, name, description, hourly_rate, status, created_at, updated_at) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, project.getClientId());
            stmt.setString(2, project.getName());
            stmt.setString(3, project.getDescription());
            stmt.setBigDecimal(4, project.getHourlyRate());
            stmt.setString(5, project.getStatus());
            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            stmt.setTimestamp(6, now);
            stmt.setTimestamp(7, now);
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                project.setId(id);
                return id;
            }
            throw new SQLException("Insert failed, no ID obtained");
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public Project getById(int id) throws SQLException {
        String sql = "SELECT * FROM projects WHERE id = ?";
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

    public List<Project> getAll() throws SQLException {
        String sql = "SELECT * FROM projects ORDER BY name";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            List<Project> projects = new ArrayList<>();
            while (rs.next()) {
                projects.add(mapRow(rs));
            }
            return projects;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public List<Project> getByClientId(int clientId) throws SQLException {
        String sql = "SELECT * FROM projects WHERE client_id = ? ORDER BY name";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, clientId);
            rs = stmt.executeQuery();
            List<Project> projects = new ArrayList<>();
            while (rs.next()) {
                projects.add(mapRow(rs));
            }
            return projects;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public boolean update(Project project) throws SQLException {
        String sql = "UPDATE projects SET client_id = ?, name = ?, description = ?, hourly_rate = ?, "
                + "status = ?, updated_at = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, project.getClientId());
            stmt.setString(2, project.getName());
            stmt.setString(3, project.getDescription());
            stmt.setBigDecimal(4, project.getHourlyRate());
            stmt.setString(5, project.getStatus());
            stmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setInt(7, project.getId());
            return stmt.executeUpdate() > 0;
        } finally {
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM projects WHERE id = ?";
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

    private Project mapRow(ResultSet rs) throws SQLException {
        Project p = new Project();
        p.setId(rs.getInt("id"));
        p.setClientId(rs.getInt("client_id"));
        p.setName(rs.getString("name"));
        p.setDescription(rs.getString("description"));
        p.setHourlyRate(rs.getBigDecimal("hourly_rate"));
        p.setStatus(rs.getString("status"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            p.setCreatedAt(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            p.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        return p;
    }
}
