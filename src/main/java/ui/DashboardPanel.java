package ui;

import dao.ClientDAO;
import dao.InvoiceDAO;
import dao.ProjectDAO;
import models.Client;
import models.Invoice;
import models.Project;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DashboardPanel extends JPanel {

    private final ClientDAO clientDAO = new ClientDAO();
    private final ProjectDAO projectDAO = new ProjectDAO();
    private final InvoiceDAO invoiceDAO = new InvoiceDAO();

    private final JLabel clientCount = new JLabel("0");
    private final JLabel projectCount = new JLabel("0");
    private final JLabel invoiceCount = new JLabel("0");
    private final JLabel revenueCount = new JLabel("$0.00");
    private final JLabel overdueCount = new JLabel("0");

    private final DefaultTableModel overdueTableModel = new DefaultTableModel(
            new String[]{"Invoice #", "Project", "Amount", "Due"}, 0) {
        @Override public boolean isCellEditable(int r, int c) { return false; }
    };
    private final JTable overdueTable = new JTable(overdueTableModel);

    private final EarningsChart earningsChart = new EarningsChart();

    public DashboardPanel() {
        setLayout(new BorderLayout());
        setBorder(new EmptyBorder(10, 10, 10, 10));

        add(createSummaryBar(), BorderLayout.NORTH);
        add(createCenterPanel(), BorderLayout.CENTER);
        loadData();
    }

    private JPanel createSummaryBar() {
        JPanel bar = new JPanel(new java.awt.GridLayout(1, 5, 10, 0));
        bar.setBorder(new EmptyBorder(5, 5, 15, 5));

        bar.add(createMetricCard("Clients", clientCount, new Color(52, 152, 219)));
        bar.add(createMetricCard("Projects", projectCount, new Color(46, 204, 113)));
        bar.add(createMetricCard("Invoices", invoiceCount, new Color(155, 89, 182)));
        bar.add(createMetricCard("Revenue", revenueCount, new Color(39, 174, 96)));
        bar.add(createMetricCard("Overdue", overdueCount, new Color(231, 76, 60)));

        return bar;
    }

    private JPanel createMetricCard(String title, JLabel valueLabel, Color accent) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBorder(new TitledBorder(null, title, TitledBorder.CENTER, TitledBorder.TOP,
                new Font("Segoe UI", Font.BOLD, 12), accent));

        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        valueLabel.setHorizontalAlignment(SwingConstants.CENTER);
        valueLabel.setForeground(accent);
        card.add(valueLabel, BorderLayout.CENTER);
        return card;
    }

    private JPanel createCenterPanel() {
        JPanel center = new JPanel(new java.awt.GridLayout(1, 2, 10, 0));

        earningsChart.setBorder(new TitledBorder("Monthly Revenue"));
        center.add(earningsChart);

        JPanel right = new JPanel(new BorderLayout());
        right.setBorder(new TitledBorder("Overdue Invoices"));

        overdueTable.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        overdueTable.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        overdueTable.setRowHeight(24);
        right.add(new JScrollPane(overdueTable), BorderLayout.CENTER);
        center.add(right);

        return center;
    }

    public void loadData() {
        try {
            List<Client> clients = clientDAO.getAll();
            List<Project> projects = projectDAO.getAll();
            List<Invoice> allInvoices = new ArrayList<>();
            for (Project p : projects) {
                allInvoices.addAll(invoiceDAO.getByProjectId(p.getId()));
            }

            clientCount.setText(String.valueOf(clients.size()));
            projectCount.setText(String.valueOf(projects.size()));
            invoiceCount.setText(String.valueOf(allInvoices.size()));

            BigDecimal totalRevenue = BigDecimal.ZERO;
            List<Invoice> overdue = new ArrayList<>();
            Map<String, BigDecimal> monthlyRevenue = new HashMap<>();
            LocalDate today = LocalDate.now();

            for (Invoice inv : allInvoices) {
                if ("Paid".equalsIgnoreCase(inv.getStatus())) {
                    totalRevenue = totalRevenue.add(inv.getAmount());
                }
                if (!"Paid".equalsIgnoreCase(inv.getStatus()) && inv.getDueDate().isBefore(today)) {
                    overdue.add(inv);
                }
                String monthKey = inv.getIssuedDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
                monthlyRevenue.merge(monthKey, inv.getAmount(), BigDecimal::add);
            }

            revenueCount.setText("$" + totalRevenue.setScale(2, RoundingMode.HALF_UP));
            overdueCount.setText(String.valueOf(overdue.size()));

            overdue.sort(Comparator.comparing(Invoice::getDueDate));
            overdueTableModel.setRowCount(0);
            for (Invoice inv : overdue) {
                Project p = projectDAO.getById(inv.getProjectId());
                overdueTableModel.addRow(new Object[]{
                        inv.getInvoiceNumber(),
                        p != null ? p.getName() : "N/A",
                        "$" + inv.getAmount().setScale(2, RoundingMode.HALF_UP),
                        inv.getDueDate().toString()
                });
            }

            earningsChart.setData(monthlyRevenue);
            earningsChart.repaint();

        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    static class EarningsChart extends JPanel {
        private List<Map.Entry<String, BigDecimal>> entries = new ArrayList<>();
        private BigDecimal maxValue = BigDecimal.ONE;

        void setData(Map<String, BigDecimal> monthlyData) {
            entries = monthlyData.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .collect(Collectors.toList());
            maxValue = entries.stream().map(Map.Entry::getValue)
                    .max(Comparator.naturalOrder()).orElse(BigDecimal.ONE);
            if (maxValue.compareTo(BigDecimal.ZERO) == 0) maxValue = BigDecimal.ONE;
        }

        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2 = (Graphics2D) g;
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            int w = getWidth() - 40;
            int h = getHeight() - 60;
            int x0 = 30;
            int y0 = 10;

            if (entries.isEmpty()) {
                g2.setColor(Color.GRAY);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 14));
                g2.drawString("No data yet", w / 2 - 30, h / 2);
                return;
            }

            int barCount = entries.size();
            int barWidth = Math.min(40, (w - (barCount - 1) * 10) / barCount);
            int gap = Math.min(20, (w - barWidth * barCount) / (barCount - 1));

            for (int i = 0; i < barCount; i++) {
                Map.Entry<String, BigDecimal> e = entries.get(i);
                int barHeight = e.getValue().multiply(BigDecimal.valueOf(h))
                        .divide(maxValue, RoundingMode.HALF_UP).intValue();
                int x = x0 + i * (barWidth + gap);
                int y = y0 + h - barHeight;

                g2.setColor(new Color(74, 144, 217));
                g2.fillRect(x, y, barWidth, barHeight);
                g2.setColor(new Color(52, 112, 185));
                g2.drawRect(x, y, barWidth, barHeight);

                g2.setColor(Color.DARK_GRAY);
                g2.setFont(new Font("Segoe UI", Font.PLAIN, 9));
                String shortLabel = e.getKey().length() > 7 ? e.getKey().substring(5) : e.getKey();
                int labelWidth = g2.getFontMetrics().stringWidth(shortLabel);
                g2.drawString(shortLabel, x + (barWidth - labelWidth) / 2, y0 + h + 15);

                String valStr = "$" + e.getValue().setScale(0, RoundingMode.HALF_UP).toString();
                int valWidth = g2.getFontMetrics().stringWidth(valStr);
                g2.setFont(new Font("Segoe UI", Font.BOLD, 10));
                g2.setColor(new Color(39, 174, 96));
                g2.drawString(valStr, x + (barWidth - valWidth) / 2, y - 5);
            }
        }

        @Override
        public Dimension getPreferredSize() {
            return new Dimension(400, 250);
        }
    }
}
