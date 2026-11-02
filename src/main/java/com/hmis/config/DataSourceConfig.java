package com.hmis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        boolean mysqlAvailable = isPortOpen("127.0.0.1", 3306, 1200);

        if (mysqlAvailable) {
            System.out.println("=========================================================");
            System.out.println("  🟢 MySQL Server DETECTED on localhost:3306!             ");
            System.out.println("  Connecting to MySQL database: hmis_db                   ");
            System.out.println("=========================================================");
            return DataSourceBuilder.create()
                    .driverClassName("com.mysql.cj.jdbc.Driver")
                    .url("jdbc:mysql://localhost:3306/hmis_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC")
                    .username(username)
                    .password(password)
                    .build();
        } else {
            System.out.println("=========================================================");
            System.out.println("  🟡 Notice: MySQL Server not currently running on 3306.  ");
            System.out.println("  Using in-memory MySQL-compatible storage for demo.      ");
            System.out.println("  To connect live MySQL: Start MySQL and restart app!     ");
            System.out.println("=========================================================");
            return DataSourceBuilder.create()
                    .driverClassName("org.h2.Driver")
                    .url("jdbc:h2:mem:hmis_db;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE")
                    .username("sa")
                    .password("")
                    .build();
        }
    }

    private boolean isPortOpen(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
