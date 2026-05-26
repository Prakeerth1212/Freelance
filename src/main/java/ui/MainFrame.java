package ui;

import models.User;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.border.EmptyBorder;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

public class MainFrame extends JFrame {

    private static final Color DARK_BG = new Color(0x2D, 0x2D, 0x2D);
    private static final Color DARKER_BG = new Color(0x1E, 0x1E, 0x1E);
    private static final Color ACCENT = new Color(0x4A, 0x90, 0xD9);
    private static final Color WHITE = Color.WHITE;

    private final JTabbedPane tabbedPane;
    private final JPanel sidebar;
    private JButton[] navButtons;
    private DashboardPanel dashboardPanel;
    private User currentUser;
    private boolean darkMode = true;

    public MainFrame() {
        if (!showLogin()) {
            System.exit(0);
        }

        setTitle("FreelanceHub - " + currentUser.getUsername());
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1200, 800);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        sidebar = createSidebar();
        add(sidebar, BorderLayout.WEST);

        tabbedPane = createTabbedPane();
        add(tabbedPane, BorderLayout.CENTER);

        applyTheme();
        setVisible(true);
    }

    private boolean showLogin() {
        LoginDialog dialog = new LoginDialog(null);
        dialog.setVisible(true);
        if (dialog.isSucceeded()) {
            currentUser = dialog.getAuthenticatedUser();
            return true;
        }
        return false;
    }

    private JPanel createSidebar() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBackground(DARK_BG);
        panel.setPreferredSize(new Dimension(200, 0));
        panel.setBorder(new EmptyBorder(10, 10, 10, 10));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 0, 5, 0);

        JLabel logo = new JLabel("FreelanceHub", SwingConstants.CENTER);
        logo.setFont(new Font("Segoe UI", Font.BOLD, 18));
        logo.setForeground(ACCENT);
        gbc.gridy = 0;
        panel.add(logo, gbc);

        String[] tabNames = {"Dashboard", "Clients", "Projects & Time", "Invoices", "AI Assistant"};
        navButtons = new JButton[tabNames.length];

        for (int i = 0; i < tabNames.length; i++) {
            JButton btn = new JButton(tabNames[i]);
            btn.setFont(new Font("Segoe UI", Font.PLAIN, 14));
            btn.setForeground(WHITE);
            btn.setBackground(DARKER_BG);
            btn.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(DARKER_BG, 1),
                    new EmptyBorder(10, 15, 10, 15)
            ));
            btn.setFocusPainted(false);
            btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
            btn.setHorizontalAlignment(SwingConstants.LEFT);

            int tabIndex = i;
            btn.addActionListener(e -> {
                tabbedPane.setSelectedIndex(tabIndex);
                updateSidebarSelection(tabIndex);
            });

            gbc.gridy = i + 1;
            panel.add(btn, gbc);
            navButtons[i] = btn;
        }

        JButton darkToggle = new JButton(darkMode ? "Light Mode" : "Dark Mode");
        darkToggle.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        darkToggle.setForeground(WHITE);
        darkToggle.setBackground(new Color(0x3D, 0x3D, 0x3D));
        darkToggle.setBorder(new EmptyBorder(8, 15, 8, 15));
        darkToggle.setFocusPainted(false);
        darkToggle.setCursor(new Cursor(Cursor.HAND_CURSOR));
        darkToggle.addActionListener(e -> {
            darkMode = !darkMode;
            darkToggle.setText(darkMode ? "Light Mode" : "Dark Mode");
            applyTheme();
        });
        gbc.gridy = tabNames.length + 1;
        panel.add(darkToggle, gbc);

        gbc.gridy = tabNames.length + 2;
        gbc.weighty = 1.0;
        panel.add(new JPanel(), gbc);

        JLabel userLabel = new JLabel("User: " + currentUser.getUsername(), SwingConstants.CENTER);
        userLabel.setFont(new Font("Segoe UI", Font.ITALIC, 11));
        userLabel.setForeground(Color.LIGHT_GRAY);
        gbc.gridy = tabNames.length + 3;
        gbc.weighty = 0.0;
        panel.add(userLabel, gbc);

        updateSidebarSelection(0);
        return panel;
    }

    private void applyTheme() {
        if (darkMode) {
            getContentPane().setBackground(DARK_BG);
            sidebar.setBackground(DARK_BG);
        } else {
            getContentPane().setBackground(new Color(0xF0, 0xF0, 0xF0));
            sidebar.setBackground(new Color(0xE0, 0xE0, 0xE0));
        }
    }

    private void updateSidebarSelection(int selected) {
        for (int i = 0; i < navButtons.length; i++) {
            if (i == selected) {
                navButtons[i].setBackground(ACCENT);
                navButtons[i].setForeground(WHITE);
            } else {
                navButtons[i].setBackground(DARKER_BG);
                navButtons[i].setForeground(WHITE);
            }
        }
    }

    private JTabbedPane createTabbedPane() {
        JTabbedPane tabs = new JTabbedPane();
        tabs.setFont(new Font("Segoe UI", Font.PLAIN, 14));

        dashboardPanel = new DashboardPanel();
        tabs.addTab("Dashboard", dashboardPanel);
        tabs.addTab("Clients", new ClientPanel());
        tabs.addTab("Projects & Time", new ProjectPanel());
        tabs.addTab("Invoices", new InvoicePanel());
        tabs.addTab("AI Assistant", new AIPanel());

        tabs.addChangeListener(e -> {
            int idx = tabs.getSelectedIndex();
            if (idx >= 0 && idx < navButtons.length) {
                updateSidebarSelection(idx);
            }
            if (idx == 0) {
                dashboardPanel.loadData();
            }
        });

        return tabs;
    }
}
