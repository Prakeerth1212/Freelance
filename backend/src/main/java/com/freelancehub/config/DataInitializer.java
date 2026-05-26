package com.freelancehub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        createTables();
        seedData();
    }

    private void createTables() {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user'
            )
        """);
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                company VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """);
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                hourly_rate DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
            )
        """);
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                invoice_number VARCHAR(50) NOT NULL,
                amount DECIMAL(12,2),
                status VARCHAR(50) DEFAULT 'draft',
                issued_date DATE,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """);
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS time_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                date DATE NOT NULL,
                hours DECIMAL(6,2) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """);
    }

    private void seedData() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        if (count == null || count == 0) {
            jdbcTemplate.update("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                    "admin", "admin", "admin");
        }
    }
}
