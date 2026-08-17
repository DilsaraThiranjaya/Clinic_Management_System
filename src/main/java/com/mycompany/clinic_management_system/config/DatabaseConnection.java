package com.mycompany.clinic_management_system.config;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Singleton database connection and DataSource provider.
 */
@Configuration(proxyBeanMethods = false)
public class DatabaseConnection {

    private static volatile DatabaseConnection instance;
    private final DataSource dataSource;

    // Singleton constructor
    DatabaseConnection() {
        this.dataSource = DataSourceBuilder.create()
                .driverClassName("org.h2.Driver")
                .url("jdbc:h2:mem:clinicdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
                .username("sa")
                .password("")
                .build();
    }

    // Thread-safe double-checked locking Singleton accessor
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }

    public DataSource getDataSource() {
        return this.dataSource;
    }

    public Connection getConnection() throws SQLException {
        return this.dataSource.getConnection();
    }

    // Spring Bean providing the singleton DataSource
    @Bean
    @Primary
    public DataSource dataSource() {
        return getInstance().getDataSource();
    }
}
