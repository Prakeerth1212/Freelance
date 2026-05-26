package db;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class DBConnection {

    private static DBConnection instance;
    private final String url;
    private final String user;
    private final String password;
    private final BlockingQueue<Connection> connectionPool;
    private final int poolSize;

    private DBConnection() {
        Properties props = new Properties();
        try (InputStream is = loadConfig()) {
            props.load(is);
        } catch (IOException e) {
            throw new RuntimeException("Could not load config.properties", e);
        }

        this.url = props.getProperty("db.url",
                "jdbc:mysql://localhost:3306/freelancehub?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        this.user = props.getProperty("db.user", "root");
        this.password = props.getProperty("db.password", "");
        this.poolSize = Integer.parseInt(props.getProperty("db.pool.size", "5"));

        this.connectionPool = new LinkedBlockingQueue<>(poolSize);
        initializePool();
        initSchema();
    }

    private void initSchema() {
        String sql = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """;
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            stmt.execute("INSERT IGNORE INTO users (username, password_hash, role) VALUES ('admin', 'admin', 'admin')");
            releaseConnection(conn);
        } catch (SQLException e) {
            System.err.println("Schema init warning: " + e.getMessage());
        }
    }

    private static InputStream loadConfig() throws IOException {
        File file = new File("config.properties");
        if (file.exists()) {
            return new FileInputStream(file);
        }
        InputStream is = DBConnection.class.getClassLoader().getResourceAsStream("config.properties");
        if (is != null) {
            return is;
        }
        throw new IOException("config.properties not found on filesystem or classpath");
    }

    public static synchronized DBConnection getInstance() {
        if (instance == null) {
            instance = new DBConnection();
        }
        return instance;
    }

    private void initializePool() {
        for (int i = 0; i < poolSize; i++) {
            try {
                Connection conn = DriverManager.getConnection(url, user, password);
                connectionPool.offer(conn);
            } catch (SQLException e) {
                throw new RuntimeException("Failed to initialize connection pool", e);
            }
        }
    }

    public Connection getConnection() throws SQLException {
        try {
            Connection conn = connectionPool.take();
            if (conn == null || conn.isClosed() || !conn.isValid(2)) {
                conn = DriverManager.getConnection(url, user, password);
            }
            return conn;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SQLException("Interrupted while acquiring connection", e);
        }
    }

    public void releaseConnection(Connection conn) {
        if (conn != null) {
            connectionPool.offer(conn);
        }
    }

    public void closePool() {
        for (Connection conn : connectionPool) {
            try {
                if (conn != null && !conn.isClosed()) {
                    conn.close();
                }
            } catch (SQLException e) {
                // ignore
            }
        }
        connectionPool.clear();
    }
}
