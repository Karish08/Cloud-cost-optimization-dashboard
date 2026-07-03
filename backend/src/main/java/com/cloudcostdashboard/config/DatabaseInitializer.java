package com.cloudcostdashboard.config;

import com.cloudcostdashboard.entity.User;
import com.cloudcostdashboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("DatabaseInitializer: Checking existing users for plain text passwords...");
        try {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                String passwordHash = user.getPasswordHash();
                // BCrypt hashes start with $2a$, $2b$, or $2y$
                if (passwordHash != null && !passwordHash.startsWith("$2a$") && !passwordHash.startsWith("$2b$") && !passwordHash.startsWith("$2y$")) {
                    log.info("DatabaseInitializer: Found non-BCrypt password for user '{}'. Hashing it now...", user.getEmail());
                    String encodedPassword = passwordEncoder.encode(passwordHash);
                    user.setPasswordHash(encodedPassword);
                    userRepository.save(user);
                    log.info("DatabaseInitializer: Password successfully hashed for user '{}'", user.getEmail());
                }
            }
        } catch (Exception e) {
            log.error("DatabaseInitializer: Error checking/migrating user passwords", e);
        }
    }
}
