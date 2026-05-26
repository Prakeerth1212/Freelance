package ui;

import dao.ClientDAO;
import models.Client;

import javax.swing.JButton;
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
import java.sql.SQLException;
import java.util.List;

public class ClientPanel extends JPanel {

    private final ClientDAO clientDAO = new ClientDAO();

    private final JTable table;
    private final DefaultTableModel tableModel;

    private final JTextField nameField = new JTextField(20);
    private final JTextField emailField = new JTextField(20);
    private final JTextField phoneField = new JTextField(20);
    private final JTextField companyField = new JTextField(20);
    private final JTextField notesField = new JTextField(20);

    private final JButton addButton = new JButton("Add");
    private final JButton updateButton = new JButton("Update");
    private final JButton deleteButton = new JButton("Delete");
    private final JButton clearButton = new JButton("Clear");

    private int selectedClientId = -1;

    public ClientPanel() {
        setLayout(new BorderLayout());
        setBorder(new EmptyBorder(10, 10, 10, 10));

        tableModel = new DefaultTableModel(new String[]{"ID", "Name", "Email", "Phone", "Company", "Notes"}, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        table = new JTable(tableModel);
        table.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        table.getTableHeader().setFont(new Font("Segoe UI", Font.BOLD, 13));
        table.setRowHeight(24);
        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                loadSelectedClient();
            }
        });

        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(new TitledBorder("Clients"));
        add(scrollPane, BorderLayout.CENTER);

        JPanel formPanel = createFormPanel();
        add(formPanel, BorderLayout.SOUTH);

        refreshTable();
    }

    private JPanel createFormPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(new TitledBorder("Client Details"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(4, 6, 4, 6);

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Name:"), gbc);

        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.WEST;
        panel.add(nameField, gbc);

        gbc.gridx = 2;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Email:"), gbc);

        gbc.gridx = 3;
        gbc.anchor = GridBagConstraints.WEST;
        panel.add(emailField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Phone:"), gbc);

        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.WEST;
        panel.add(phoneField, gbc);

        gbc.gridx = 2;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Company:"), gbc);

        gbc.gridx = 3;
        gbc.anchor = GridBagConstraints.WEST;
        panel.add(companyField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Notes:"), gbc);

        gbc.gridx = 1;
        gbc.gridwidth = 3;
        gbc.anchor = GridBagConstraints.WEST;
        panel.add(notesField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 1;
        gbc.anchor = GridBagConstraints.CENTER;
        gbc.insets = new Insets(10, 6, 4, 6);
        panel.add(addButton, gbc);

        gbc.gridx = 1;
        panel.add(updateButton, gbc);

        gbc.gridx = 2;
        panel.add(deleteButton, gbc);

        gbc.gridx = 3;
        panel.add(clearButton, gbc);

        addButton.addActionListener(e -> addClient());
        updateButton.addActionListener(e -> updateClient());
        deleteButton.addActionListener(e -> deleteClient());
        clearButton.addActionListener(e -> clearForm());

        return panel;
    }

    private void addClient() {
        String name = nameField.getText().trim();
        if (name.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Name is required.", "Validation Error", JOptionPane.WARNING_MESSAGE);
            return;
        }

        Client client = new Client(name, emailField.getText().trim(), phoneField.getText().trim(),
                companyField.getText().trim(), notesField.getText().trim());

        try {
            clientDAO.insert(client);
            clearForm();
            refreshTable();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error adding client:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void updateClient() {
        if (selectedClientId == -1) {
            JOptionPane.showMessageDialog(this, "Select a client from the table first.", "No Selection",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        Client client = new Client(nameField.getText().trim(), emailField.getText().trim(),
                phoneField.getText().trim(), companyField.getText().trim(), notesField.getText().trim());
        client.setId(selectedClientId);

        try {
            clientDAO.update(client);
            clearForm();
            refreshTable();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error updating client:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void deleteClient() {
        if (selectedClientId == -1) {
            JOptionPane.showMessageDialog(this, "Select a client from the table first.", "No Selection",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        int confirm = JOptionPane.showConfirmDialog(this, "Delete the selected client?",
                "Confirm Delete", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
        if (confirm != JOptionPane.YES_OPTION) {
            return;
        }

        try {
            clientDAO.delete(selectedClientId);
            clearForm();
            refreshTable();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error deleting client:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void loadSelectedClient() {
        int row = table.getSelectedRow();
        if (row == -1) {
            return;
        }

        selectedClientId = (int) tableModel.getValueAt(row, 0);
        nameField.setText((String) tableModel.getValueAt(row, 1));
        emailField.setText((String) tableModel.getValueAt(row, 2));
        phoneField.setText((String) tableModel.getValueAt(row, 3));
        companyField.setText((String) tableModel.getValueAt(row, 4));
        notesField.setText((String) tableModel.getValueAt(row, 5));
    }

    private void clearForm() {
        selectedClientId = -1;
        table.clearSelection();
        nameField.setText("");
        emailField.setText("");
        phoneField.setText("");
        companyField.setText("");
        notesField.setText("");
        nameField.requestFocusInWindow();
    }

    private void refreshTable() {
        tableModel.setRowCount(0);
        try {
            List<Client> clients = clientDAO.getAll();
            for (Client c : clients) {
                tableModel.addRow(new Object[]{
                        c.getId(),
                        c.getName(),
                        c.getEmail(),
                        c.getPhone(),
                        c.getCompany(),
                        c.getNotes()
                });
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this, "Error loading clients:\n" + ex.getMessage(),
                    "Database Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
