package com.freelancehub.dao;

import com.freelancehub.model.Invoice;
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
public class InvoiceDAO {

    private final JdbcTemplate jdbcTemplate;

    public InvoiceDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Invoice insert(Invoice invoice) {
        String sql = "INSERT INTO invoices (project_id, invoice_number, amount, status, issued_date, due_date, "
                + "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, invoice.getProjectId());
            ps.setString(2, invoice.getInvoiceNumber());
            ps.setBigDecimal(3, invoice.getAmount());
            ps.setString(4, invoice.getStatus());
            ps.setDate(5, Date.valueOf(invoice.getIssuedDate()));
            ps.setDate(6, Date.valueOf(invoice.getDueDate()));
            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            ps.setTimestamp(7, now);
            ps.setTimestamp(8, now);
            return ps;
        }, keyHolder);
        invoice.setId(keyHolder.getKey().intValue());
        return invoice;
    }

    public Optional<Invoice> getById(int id) {
        try {
            String sql = "SELECT * FROM invoices WHERE id = ?";
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, invoiceRowMapper(), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Invoice> getAll() {
        String sql = "SELECT * FROM invoices ORDER BY issued_date DESC";
        return jdbcTemplate.query(sql, invoiceRowMapper());
    }

    public List<Invoice> getByProjectId(int projectId) {
        String sql = "SELECT * FROM invoices WHERE project_id = ? ORDER BY issued_date DESC";
        return jdbcTemplate.query(sql, invoiceRowMapper(), projectId);
    }

    public boolean update(Invoice invoice) {
        String sql = "UPDATE invoices SET project_id = ?, invoice_number = ?, amount = ?, status = ?, "
                + "issued_date = ?, due_date = ?, updated_at = ? WHERE id = ?";
        return jdbcTemplate.update(sql, invoice.getProjectId(), invoice.getInvoiceNumber(),
                invoice.getAmount(), invoice.getStatus(), Date.valueOf(invoice.getIssuedDate()),
                Date.valueOf(invoice.getDueDate()), Timestamp.valueOf(LocalDateTime.now()),
                invoice.getId()) > 0;
    }

    public boolean delete(int id) {
        String sql = "DELETE FROM invoices WHERE id = ?";
        return jdbcTemplate.update(sql, id) > 0;
    }

    public String getLastInvoiceNumber() {
        try {
            String sql = "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1";
            return jdbcTemplate.queryForObject(sql, String.class);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    private RowMapper<Invoice> invoiceRowMapper() {
        return (rs, rowNum) -> {
            Invoice inv = new Invoice();
            inv.setId(rs.getInt("id"));
            inv.setProjectId(rs.getInt("project_id"));
            inv.setInvoiceNumber(rs.getString("invoice_number"));
            inv.setAmount(rs.getBigDecimal("amount"));
            inv.setStatus(rs.getString("status"));
            Date issued = rs.getDate("issued_date");
            if (issued != null) inv.setIssuedDate(issued.toLocalDate());
            Date due = rs.getDate("due_date");
            if (due != null) inv.setDueDate(due.toLocalDate());
            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) inv.setCreatedAt(createdAt.toLocalDateTime());
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) inv.setUpdatedAt(updatedAt.toLocalDateTime());
            return inv;
        };
    }
}
