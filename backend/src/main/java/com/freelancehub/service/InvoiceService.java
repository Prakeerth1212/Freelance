package com.freelancehub.service;

import com.freelancehub.dao.InvoiceDAO;
import com.freelancehub.model.Invoice;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceDAO invoiceDAO;

    public InvoiceService(InvoiceDAO invoiceDAO) {
        this.invoiceDAO = invoiceDAO;
    }

    public Invoice create(Invoice invoice) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isBlank()) {
            invoice.setInvoiceNumber(generateInvoiceNumber());
        }
        return invoiceDAO.insert(invoice);
    }

    public Optional<Invoice> getById(int id) {
        return invoiceDAO.getById(id);
    }

    public List<Invoice> getAll() {
        return invoiceDAO.getAll();
    }

    public List<Invoice> getByProjectId(int projectId) {
        return invoiceDAO.getByProjectId(projectId);
    }

    public boolean update(Invoice invoice) {
        return invoiceDAO.update(invoice);
    }

    public boolean delete(int id) {
        return invoiceDAO.delete(id);
    }

    public Optional<Invoice> togglePaid(int id) {
        return invoiceDAO.getById(id).map(invoice -> {
            if ("Paid".equalsIgnoreCase(invoice.getStatus())) {
                invoice.setStatus("Unpaid");
            } else {
                invoice.setStatus("Paid");
            }
            invoiceDAO.update(invoice);
            return invoice;
        });
    }

    public String generateInvoiceNumber() {
        String last = invoiceDAO.getLastInvoiceNumber();
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        if (last != null && last.startsWith("INV-" + datePart)) {
            int seq = Integer.parseInt(last.substring(last.lastIndexOf('-') + 1)) + 1;
            return String.format("INV-%s-%04d", datePart, seq);
        }
        return String.format("INV-%s-0001", datePart);
    }
}
