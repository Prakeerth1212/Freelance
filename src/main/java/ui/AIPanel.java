package ui;

import ai.GeminiAPIClient;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingWorker;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

public class AIPanel extends JPanel {

    private final JTextArea promptArea = new JTextArea(5, 50);
    private final JTextArea responseArea = new JTextArea(20, 50);
    private final JButton sendButton = new JButton("Send");
    private final JLabel statusLabel = new JLabel("Ready");

    public AIPanel() {
        setLayout(new BorderLayout());
        setBorder(new EmptyBorder(10, 10, 10, 10));

        add(createInputPanel(), BorderLayout.NORTH);
        add(createOutputPanel(), BorderLayout.CENTER);
        add(createStatusBar(), BorderLayout.SOUTH);
    }

    private JPanel createInputPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(new TitledBorder("Prompt"));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.BOTH;
        gbc.insets = new Insets(5, 5, 5, 5);

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.weightx = 1.0;
        gbc.weighty = 1.0;
        promptArea.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        promptArea.setLineWrap(true);
        promptArea.setWrapStyleWord(true);
        JScrollPane promptScroll = new JScrollPane(promptArea);
        panel.add(promptScroll, gbc);

        gbc.gridx = 1;
        gbc.weightx = 0.0;
        gbc.weighty = 0.0;
        gbc.fill = GridBagConstraints.NONE;
        gbc.anchor = GridBagConstraints.NORTH;
        sendButton.setFont(new Font("Segoe UI", Font.BOLD, 13));
        sendButton.setMargin(new Insets(8, 20, 8, 20));
        panel.add(sendButton, gbc);

        sendButton.addActionListener(e -> sendPrompt());
        return panel;
    }

    private JPanel createOutputPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(new TitledBorder("Response"));

        responseArea.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        responseArea.setLineWrap(true);
        responseArea.setWrapStyleWord(true);
        responseArea.setEditable(false);

        panel.add(new JScrollPane(responseArea), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createStatusBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setBorder(new EmptyBorder(5, 5, 5, 5));
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        bar.add(statusLabel, BorderLayout.WEST);
        return bar;
    }

    private void sendPrompt() {
        String prompt = promptArea.getText().trim();
        if (prompt.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Enter a prompt first.", "Empty Prompt",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        sendButton.setEnabled(false);
        statusLabel.setText("Generating...");
        responseArea.setText("");

        new SwingWorker<String, Void>() {
            @Override
            protected String doInBackground() throws Exception {
                GeminiAPIClient client = new GeminiAPIClient();
                return client.generateContent(prompt);
            }

            @Override
            protected void done() {
                try {
                    String result = get();
                    responseArea.setText(result);
                    statusLabel.setText("Done");
                } catch (Exception ex) {
                    responseArea.setText("");
                    statusLabel.setText("Error");
                    JOptionPane.showMessageDialog(AIPanel.this,
                            "Error contacting Gemini API:\n" + ex.getMessage(),
                            "API Error", JOptionPane.ERROR_MESSAGE);
                } finally {
                    sendButton.setEnabled(true);
                }
            }
        }.execute();
    }
}
