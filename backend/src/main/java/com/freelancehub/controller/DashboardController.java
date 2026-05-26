package com.freelancehub.controller;

import com.freelancehub.dao.ClientDAO;
import com.freelancehub.dao.InvoiceDAO;
import com.freelancehub.dao.ProjectDAO;
import com.freelancehub.dao.TimeLogDAO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ClientDAO clientDAO;
    private final ProjectDAO projectDAO;
    private final InvoiceDAO invoiceDAO;
    private final TimeLogDAO timeLogDAO;

    public DashboardController(ClientDAO clientDAO, ProjectDAO projectDAO,
                               InvoiceDAO invoiceDAO, TimeLogDAO timeLogDAO) {
        this.clientDAO = clientDAO;
        this.projectDAO = projectDAO;
        this.invoiceDAO = invoiceDAO;
        this.timeLogDAO = timeLogDAO;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalClients", clientDAO.getAll().size());
        summary.put("totalProjects", projectDAO.getAll().size());
        summary.put("totalTimeLogs", timeLogDAO.getAll().size());

        var invoices = invoiceDAO.getAll();
        summary.put("totalInvoices", invoices.size());

        long paidCount = invoices.stream()
                .filter(i -> "Paid".equalsIgnoreCase(i.getStatus()))
                .count();
        summary.put("paidInvoices", paidCount);
        summary.put("unpaidInvoices", invoices.size() - paidCount);

        BigDecimal totalAmount = invoices.stream()
                .map(i -> i.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalInvoiceAmount", totalAmount);

        BigDecimal paidAmount = invoices.stream()
                .filter(i -> "Paid".equalsIgnoreCase(i.getStatus()))
                .map(i -> i.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("paidAmount", paidAmount);

        return ResponseEntity.ok(summary);
    }
}
