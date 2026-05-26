package ui;

import dao.ClientDAO;
import dao.ProjectDAO;
import dao.TimeLogDAO;
import models.Client;
import models.Project;
import models.TimeLog;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

public class ProjectPanel extends JPanel {

    private final ClientDAO clientDAO = new ClientDAO();
    private final ProjectDAO projectDAO = new ProjectDAO();
    private final TimeLogDAO timeLogDAO = new TimeLogDAO();

    private final JComboBox<Client> clientCombo = new JComboBox<>();
    private final JLabel totalHoursLabel = new JLabel("0.0");
    private final JLabel totalEarningsLabel = new JLabel("$0.00");

    private final DefaultTableModel projectTableModel = new DefaultTableModel(
            new String[]{"ID", "Name", "Rate", "Status"}, 0) {
        @Override public boolean isCellEditable(int r, int c) { return false; }
    };
    private final JTable projectTable = new JTable(projectTableModel);

    private final DefaultTableModel timeLogTableModel = new DefaultTableModel(
            new String[]{"ID", "Date", "Hours", "Description"}, 0) {
        @Override public boolean isCellEditable(int r, int c) { return false; }
    };
    private final JTable timeLogTable = new JTable(timeLogTableModel);

    private final JTextField projectNameField = new JTextField(15);
    private final JTextField projectRateField = new JTextField(10);
    private final JComboBox<String> projectStatusCombo = new JComboBox<>(
            new String[]{"Active", "Completed", "On Hold"});

    private final JTextField logDateField = new JTextField(10);
    private final JTextField logHoursField = new JTextField(8);
    private final JTextField logDescField = new JTextField(15);

    private final JButton addProjectButton = new JButton("Add Project");
    private final JButton addLogButton = new JButton("Add Time Log");

    private List<Client> clientList;
    private int selectedProjectId = -1;
    private BigDecimal selectedProjectRate = BigDecimal.ZERO;

    public ProjectPanel() {
        setLayout(new BorderLayout());
        setBorder(new EmptyBorder(10, 10, 10, 10));

        add(createTopBar(), BorderLayout.NORTH);

        JPanel center = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.BOTH;
        gbc.insets = new Insets(5, 5, 5, 5);

        gbc.gridx = 0; gbc.gridy = 0;
        gbc.weightx = 0.5; gbc.weighty = 1.0;
        center.add(createProjectsSection(), gbc);

        gbc.gridx = 1; gbc.gridy = 0;
        center.add(createTimeLogsSection(), gbc);

        gbc.gridx = 0; gbc.gridy = 1;
        gbc.weighty = 0.0;
        center.add(createProjectForm(), gbc);

        gbc.gridx = 1; gbc.gridy = 1;
        center.add(createTimeLogForm(), gbc);

        add(center, BorderLayout.CENTER);

        loadClients();
    }

    private JPanel createTopBar() {
        JPanel bar = new JPanel(new GridBagLayout());
        bar.setBorder(new TitledBorder("Client Selection & Summary"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 10, 5, 10);

        gbc.gridx = 0;
        gbc.anchor = GridBagConstraints.EAST;
        bar.add(new JLabel("Client:"), gbc);

        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.WEST;
        gbc.weightx = 0.3;
        bar.add(clientCombo, gbc);

        gbc.gridx = 2;
        gbc.weightx = 0.0;
        gbc.anchor = GridBagConstraints.EAST;
        bar.add(new JLabel("  Total Hours:"), gbc);

        gbc.gridx = 3;
        gbc.anchor = GridBagConstraints.WEST;
        totalHoursLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        bar.add(totalHoursLabel, gbc);

        gbc.gridx = 4;
        gbc.anchor = GridBagConstraints.EAST;
        bar.add(new JLabel("  Earnings:"), gbc);

        gbc.gridx = 5;
        gbc.anchor = GridBagConstraints.WEST;
        gbc.weightx = 0.3;
        totalEarningsLabel.setFont(new Font("Segoe UI", Font.BOLD, 16));
        bar.add(totalEarningsLabel, gbc);

        gbc.gridx = 6;
        gbc.weightx = 1.0;
        bar.add(new JPanel(), gbc);

        clientCombo.addActionListener(e -> {
            Client c = (Client) clientCombo.getSelectedItem();
            if (c != null) {
                loadProjects(c.getId());
            } else {
                projectTableModel.setRowCount(0);
            }
        });

        return bar;
    }

    private JPanel createProjectsSection() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(new TitledBorder("Projects"));

        projectTable.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        projectTable.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        projectTable.setRowHeight(24);

        projectTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                loadSelectedProject();
            }
        });

        panel.add(new JScrollPane(projectTable), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createTimeLogsSection() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(new TitledBorder("Time Logs"));

        timeLogTable.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        timeLogTable.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        timeLogTable.setRowHeight(24);

        panel.add(new JScrollPane(timeLogTable), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createProjectForm() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(new TitledBorder("Add Project"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(3, 5, 3, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        gbc.gridx = 0; gbc.gridy = 0;
        panel.add(new JLabel("Name:"), gbc);

        gbc.gridx = 1;
        panel.add(projectNameField, gbc);

        gbc.gridx = 0; gbc.gridy = 1;
        panel.add(new JLabel("Rate ($/hr):"), gbc);

        gbc.gridx = 1;
        panel.add(projectRateField, gbc);

        gbc.gridx = 0; gbc.gridy = 2;
        panel.add(new JLabel("Status:"), gbc);

        gbc.gridx = 1;
        panel.add(projectStatusCombo, gbc);

        gbc.gridx = 0; gbc.gridy = 3;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        addProjectButton.setFont(new Font("Segoe UI", Font.BOLD, 13));
        panel.add(addProjectButton, gbc);

        addProjectButton.addActionListener(e -> addProject());
        return panel;
    }

    private JPanel createTimeLogForm() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(new TitledBorder("Add Time Log"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(3, 5, 3, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        gbc.gridx = 0; gbc.gridy = 0;
        panel.add(new JLabel("Date (yyyy-MM-dd):"), gbc);

        gbc.gridx = 1;
        logDateField.setText(LocalDate.now().toString());
        panel.add(logDateField, gbc);

        gbc.gridx = 0; gbc.gridy = 1;
        panel.add(new JLabel("Hours:"), gbc);

        gbc.gridx = 1;
        panel.add(logHoursField, gbc);

        gbc.gridx = 0; gbc.gridy = 2;
        panel.add(new JLabel("Description:"), gbc);

        gbc.gridx = 1;
        panel.add(logDescField, gbc);

        gbc.gridx = 0; gbc.gridy = 3;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        addLogButton.setFont(new Font("Segoe UI", Font.BOLD, 13));
        panel.add(addLogButton, gbc);

        addLogButton.addActionListener(e -> addTimeLog());
        return panel;
    }

    private void loadClients() {
        try {
            clientList = clientDAO.getAll();
            clientCombo.removeAllItems();
            for (Client c : clientList) {
                clientCombo.addItem(c);
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error loading clients:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void loadProjects(int clientId) {
        projectTableModel.setRowCount(0);
        timeLogTableModel.setRowCount(0);
        selectedProjectId = -1;
        selectedProjectRate = BigDecimal.ZERO;
        updateTotals();

        try {
            List<Project> projects = projectDAO.getByClientId(clientId);
            for (Project p : projects) {
                projectTableModel.addRow(new Object[]{
                        p.getId(),
                        p.getName(),
                        "$" + p.getHourlyRate().setScale(2, RoundingMode.HALF_UP),
                        p.getStatus()
                });
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error loading projects:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void loadSelectedProject() {
        int row = projectTable.getSelectedRow();
        if (row == -1) {
            timeLogTableModel.setRowCount(0);
            selectedProjectId = -1;
            selectedProjectRate = BigDecimal.ZERO;
            updateTotals();
            return;
        }

        selectedProjectId = (int) projectTableModel.getValueAt(row, 0);

        try {
            Project p = projectDAO.getById(selectedProjectId);
            selectedProjectRate = p != null ? p.getHourlyRate() : BigDecimal.ZERO;
        } catch (SQLException ex) {
            selectedProjectRate = BigDecimal.ZERO;
        }

        loadTimeLogs(selectedProjectId);
    }

    private void loadTimeLogs(int projectId) {
        timeLogTableModel.setRowCount(0);
        BigDecimal totalHours = BigDecimal.ZERO;

        try {
            List<TimeLog> logs = timeLogDAO.getByProjectId(projectId);
            for (TimeLog t : logs) {
                timeLogTableModel.addRow(new Object[]{
                        t.getId(),
                        t.getDate().toString(),
                        t.getHours().setScale(2, RoundingMode.HALF_UP),
                        t.getDescription()
                });
                totalHours = totalHours.add(t.getHours());
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error loading time logs:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }

        updateTotals(totalHours);
    }

    private void updateTotals() {
        BigDecimal totalHours = BigDecimal.ZERO;
        for (int i = 0; i < timeLogTableModel.getRowCount(); i++) {
            Object val = timeLogTableModel.getValueAt(i, 2);
            if (val != null) {
                try {
                    totalHours = totalHours.add(new BigDecimal(val.toString().replace("$", "")));
                } catch (NumberFormatException ignored) {}
            }
        }
        updateTotals(totalHours);
    }

    private void updateTotals(BigDecimal totalHours) {
        totalHoursLabel.setText(totalHours.setScale(2, RoundingMode.HALF_UP).toString());

        BigDecimal earnings = totalHours.multiply(selectedProjectRate).setScale(2, RoundingMode.HALF_UP);
        totalEarningsLabel.setText("$" + earnings);
    }

    private void addProject() {
        Client client = (Client) clientCombo.getSelectedItem();
        if (client == null) {
            JOptionPane.showMessageDialog(this, "Select a client first.", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        String name = projectNameField.getText().trim();
        if (name.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Project name is required.", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        BigDecimal rate;
        try {
            rate = new BigDecimal(projectRateField.getText().trim());
            if (rate.compareTo(BigDecimal.ZERO) < 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Enter a valid hourly rate.", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        String status = (String) projectStatusCombo.getSelectedItem();

        Project project = new Project(client.getId(), name, "", rate, status);
        try {
            projectDAO.insert(project);
            projectNameField.setText("");
            projectRateField.setText("");
            projectStatusCombo.setSelectedIndex(0);
            loadProjects(client.getId());
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error adding project:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void addTimeLog() {
        if (selectedProjectId == -1) {
            JOptionPane.showMessageDialog(this, "Select a project from the table first.", "No Selection",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        LocalDate date;
        try {
            date = LocalDate.parse(logDateField.getText().trim(), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ex) {
            JOptionPane.showMessageDialog(this, "Enter a valid date (yyyy-MM-dd).", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        BigDecimal hours;
        try {
            hours = new BigDecimal(logHoursField.getText().trim());
            if (hours.compareTo(BigDecimal.ZERO) <= 0 || hours.compareTo(new BigDecimal("24")) > 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Enter valid hours (0-24).", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        String desc = logDescField.getText().trim();

        TimeLog log = new TimeLog(selectedProjectId, date, hours, desc);
        try {
            timeLogDAO.insert(log);
            logDateField.setText(LocalDate.now().toString());
            logHoursField.setText("");
            logDescField.setText("");
            loadTimeLogs(selectedProjectId);
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error adding time log:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
