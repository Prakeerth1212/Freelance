package dao;

import db.DBConnection;
import models.Invoice;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class InvoiceDAO {

    public int insert(Invoice invoice) throws SQLException {
        String sql = "INSERT INTO invoices (project_id, invoice_number, amount, status, issued_date, due_date, "
                + "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, invoice.getProjectId());
            stmt.setString(2, invoice.getInvoiceNumber());
            stmt.setBigDecimal(3, invoice.getAmount());
            stmt.setString(4, invoice.getStatus());
            stmt.setDate(5, Date.valueOf(invoice.getIssuedDate()));
            stmt.setDate(6, Date.valueOf(invoice.getDueDate()));
            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            stmt.setTimestamp(7, now);
            stmt.setTimestamp(8, now);
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                invoice.setId(id);
                return id;
            }
            throw new SQLException("Insert failed, no ID obtained");
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public Invoice getById(int id) throws SQLException {
        String sql = "SELECT * FROM invoices WHERE id = ?";
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

    public List<Invoice> getAll() throws SQLException {
        String sql = "SELECT * FROM invoices ORDER BY issued_date DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();
            List<Invoice> invoices = new ArrayList<>();
            while (rs.next()) {
                invoices.add(mapRow(rs));
            }
            return invoices;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public List<Invoice> getByProjectId(int projectId) throws SQLException {
        String sql = "SELECT * FROM invoices WHERE project_id = ? ORDER BY issued_date DESC";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, projectId);
            rs = stmt.executeQuery();
            List<Invoice> invoices = new ArrayList<>();
            while (rs.next()) {
                invoices.add(mapRow(rs));
            }
            return invoices;
        } finally {
            if (rs != null) try { rs.close(); } catch (SQLException e) { /* ignore */ }
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public boolean update(Invoice invoice) throws SQLException {
        String sql = "UPDATE invoices SET project_id = ?, invoice_number = ?, amount = ?, status = ?, "
                + "issued_date = ?, due_date = ?, updated_at = ? WHERE id = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        try {
            conn = DBConnection.getInstance().getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, invoice.getProjectId());
            stmt.setString(2, invoice.getInvoiceNumber());
            stmt.setBigDecimal(3, invoice.getAmount());
            stmt.setString(4, invoice.getStatus());
            stmt.setDate(5, Date.valueOf(invoice.getIssuedDate()));
            stmt.setDate(6, Date.valueOf(invoice.getDueDate()));
            stmt.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setInt(8, invoice.getId());
            return stmt.executeUpdate() > 0;
        } finally {
            if (stmt != null) try { stmt.close(); } catch (SQLException e) { /* ignore */ }
            DBConnection.getInstance().releaseConnection(conn);
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM invoices WHERE id = ?";
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

    private Invoice mapRow(ResultSet rs) throws SQLException {
        Invoice inv = new Invoice();
        inv.setId(rs.getInt("id"));
        inv.setProjectId(rs.getInt("project_id"));
        inv.setInvoiceNumber(rs.getString("invoice_number"));
        inv.setAmount(rs.getBigDecimal("amount"));
        inv.setStatus(rs.getString("status"));

        Date issued = rs.getDate("issued_date");
        if (issued != null) {
            inv.setIssuedDate(issued.toLocalDate());
        }
        Date due = rs.getDate("due_date");
        if (due != null) {
            inv.setDueDate(due.toLocalDate());
        }

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            inv.setCreatedAt(createdAt.toLocalDateTime());
        }
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            inv.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        return inv;
    }
}
