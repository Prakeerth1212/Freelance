package ui;

import dao.InvoiceDAO;
import dao.ProjectDAO;
import dao.TimeLogDAO;
import models.Invoice;
import models.Project;
import models.TimeLog;
import utils.PDFGenerator;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.io.File;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class InvoicePanel extends JPanel {

    private final ProjectDAO projectDAO = new ProjectDAO();
    private final TimeLogDAO timeLogDAO = new TimeLogDAO();
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();

    private final JComboBox<Project> projectCombo = new JComboBox<>();
    private final JLabel unbilledAmountLabel = new JLabel("$0.00");

    private final DefaultTableModel invoiceTableModel = new DefaultTableModel(
            new String[]{"ID", "Invoice #", "Amount", "Status", "Issued", "Due"}, 0) {
        @Override public boolean isCellEditable(int r, int c) { return false; }
    };
    private final JTable invoiceTable = new JTable(invoiceTableModel);

    private final JButton generateButton = new JButton("Generate Invoice");
    private final JButton exportPdfButton = new JButton("Export PDF");
    private final JButton markPaidButton = new JButton("Mark as Paid");

    private List<Project> projectList;
    private int selectedInvoiceId = -1;

    public InvoicePanel() {
        setLayout(new BorderLayout());
        setBorder(new EmptyBorder(10, 10, 10, 10));

        add(createTopBar(), BorderLayout.NORTH);
        add(createInvoiceSection(), BorderLayout.CENTER);
        add(createActionBar(), BorderLayout.SOUTH);

        loadProjects();
    }

    private JPanel createTopBar() {
        JPanel bar = new JPanel(new GridBagLayout());
        bar.setBorder(new TitledBorder("Project & Summary"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 10, 5, 10);

        gbc.gridx = 0;
        gbc.anchor = GridBagConstraints.EAST;
        bar.add(new JLabel("Project:"), gbc);

        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.WEST;
        gbc.weightx = 0.4;
        bar.add(projectCombo, gbc);

        gbc.gridx = 2;
        gbc.weightx = 0.0;
        gbc.anchor = GridBagConstraints.EAST;
        bar.add(new JLabel("  Available to Invoice:"), gbc);

        gbc.gridx = 3;
        gbc.anchor = GridBagConstraints.WEST;
        gbc.weightx = 0.4;
        unbilledAmountLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        bar.add(unbilledAmountLabel, gbc);

        gbc.gridx = 4;
        gbc.weightx = 1.0;
        bar.add(new JPanel(), gbc);

        projectCombo.addActionListener(e -> {
            Project p = (Project) projectCombo.getSelectedItem();
            if (p != null) {
                refreshInvoices(p.getId());
                updateUnbilledAmount(p.getId());
            } else {
                invoiceTableModel.setRowCount(0);
                unbilledAmountLabel.setText("$0.00");
            }
        });

        return bar;
    }

    private JPanel createInvoiceSection() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(new TitledBorder("Invoices"));

        invoiceTable.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        invoiceTable.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        invoiceTable.setRowHeight(24);

        invoiceTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                int row = invoiceTable.getSelectedRow();
                if (row != -1) {
                    selectedInvoiceId = (int) invoiceTableModel.getValueAt(row, 0);
                } else {
                    selectedInvoiceId = -1;
                }
            }
        });

        panel.add(new JScrollPane(invoiceTable), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createActionBar() {
        JPanel bar = new JPanel(new GridBagLayout());
        bar.setBorder(new TitledBorder("Actions"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 10, 5, 10);
        gbc.fill = GridBagConstraints.NONE;

        gbc.gridx = 0;
        gbc.anchor = GridBagConstraints.CENTER;
        generateButton.setFont(new Font("Segoe UI", Font.BOLD, 13));
        bar.add(generateButton, gbc);

        gbc.gridx = 1;
        markPaidButton.setFont(new Font("Segoe UI", Font.BOLD, 13));
        bar.add(markPaidButton, gbc);

        gbc.gridx = 2;
        exportPdfButton.setFont(new Font("Segoe UI", Font.BOLD, 13));
        bar.add(exportPdfButton, gbc);

        gbc.gridx = 3;
        gbc.weightx = 1.0;
        bar.add(new JPanel(), gbc);

        generateButton.addActionListener(e -> generateInvoice());
        markPaidButton.addActionListener(e -> togglePaidStatus());
        exportPdfButton.addActionListener(e -> exportPdf());

        return bar;
    }

    private void loadProjects() {
        try {
            projectList = projectDAO.getAll();
            projectCombo.removeAllItems();
            for (Project p : projectList) {
                projectCombo.addItem(p);
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error loading projects:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void refreshInvoices(int projectId) {
        invoiceTableModel.setRowCount(0);
        try {
            List<Invoice> invoices = invoiceDAO.getByProjectId(projectId);
            for (Invoice inv : invoices) {
                invoiceTableModel.addRow(new Object[]{
                        inv.getId(),
                        inv.getInvoiceNumber(),
                        "$" + inv.getAmount().setScale(2, RoundingMode.HALF_UP),
                        inv.getStatus(),
                        inv.getIssuedDate().toString(),
                        inv.getDueDate().toString()
                });
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error loading invoices:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void updateUnbilledAmount(int projectId) {
        try {
            Project project = projectDAO.getById(projectId);
            if (project == null) {
                unbilledAmountLabel.setText("$0.00");
                return;
            }

            List<TimeLog> logs = timeLogDAO.getByProjectId(projectId);
            BigDecimal totalHours = BigDecimal.ZERO;
            for (TimeLog t : logs) {
                totalHours = totalHours.add(t.getHours());
            }

            BigDecimal grossAmount = totalHours.multiply(project.getHourlyRate());

            List<Invoice> invoices = invoiceDAO.getByProjectId(projectId);
            BigDecimal invoicedAmount = BigDecimal.ZERO;
            for (Invoice inv : invoices) {
                invoicedAmount = invoicedAmount.add(inv.getAmount());
            }

            BigDecimal unbilled = grossAmount.subtract(invoicedAmount);
            if (unbilled.compareTo(BigDecimal.ZERO) < 0) {
                unbilled = BigDecimal.ZERO;
            }

            unbilledAmountLabel.setText("$" + unbilled.setScale(2, RoundingMode.HALF_UP));
        } catch (SQLException ex) {
            unbilledAmountLabel.setText("$0.00");
        }
    }

    private void generateInvoice() {
        Project project = (Project) projectCombo.getSelectedItem();
        if (project == null) {
            JOptionPane.showMessageDialog(this, "Select a project first.", "No Selection",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        String unbilledStr = unbilledAmountLabel.getText().replace("$", "");
        BigDecimal amount = new BigDecimal(unbilledStr);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            JOptionPane.showMessageDialog(this, "No unbilled hours to invoice.", "Zero Amount",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        int invoiceCount = invoiceTableModel.getRowCount() + 1;
        String invoiceNumber = "INV-" + project.getId() + "-" + System.currentTimeMillis();

        LocalDate today = LocalDate.now();
        LocalDate dueDate = today.plusDays(30);

        Invoice invoice = new Invoice(project.getId(), invoiceNumber, amount, "Unpaid", today, dueDate);

        try {
            invoiceDAO.insert(invoice);
            refreshInvoices(project.getId());
            updateUnbilledAmount(project.getId());
            JOptionPane.showMessageDialog(this, "Invoice " + invoiceNumber + " generated successfully.",
                    "Success", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error generating invoice:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void togglePaidStatus() {
        if (selectedInvoiceId == -1) {
            JOptionPane.showMessageDialog(this, "Select an invoice from the table first.", "No Selection",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            Invoice invoice = invoiceDAO.getById(selectedInvoiceId);
            if (invoice == null) {
                JOptionPane.showMessageDialog(this, "Invoice not found.", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            String newStatus = invoice.getStatus().equals("Paid") ? "Unpaid" : "Paid";
            invoice.setStatus(newStatus);
            invoiceDAO.update(invoice);

            Project project = (Project) projectCombo.getSelectedItem();
            if (project != null) {
                refreshInvoices(project.getId());
                updateUnbilledAmount(project.getId());
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error updating invoice:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void exportPdf() {
        if (selectedInvoiceId == -1) {
            JOptionPane.showMessageDialog(this, "Select an invoice from the table first.", "No Selection",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            PDFGenerator pdfGen = new PDFGenerator();
            String path = pdfGen.generateInvoice(selectedInvoiceId);

            JOptionPane.showMessageDialog(this, "PDF exported successfully:\n" + path,
                    "Success", JOptionPane.INFORMATION_MESSAGE);
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error exporting PDF:\n" + ex.getMessage(),
                    "Export Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
