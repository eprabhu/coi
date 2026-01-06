package com.polus.fibicomp.config;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.jdbc.datasource.DelegatingDataSource;

public class SafeUpdatesDataSource extends DelegatingDataSource {

    public SafeUpdatesDataSource(DataSource targetDataSource) {
        super(targetDataSource);
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection conn = super.getConnection();
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET SQL_SAFE_UPDATES = 0;");
        }
        return conn;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection conn = super.getConnection(username, password);
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET SQL_SAFE_UPDATES = 0;");
        }
        return conn;
    }
}
