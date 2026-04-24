package com.campus.hub.security;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RoleColumnSchemaFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(RoleColumnSchemaFixer.class);

    private final JdbcTemplate jdbcTemplate;

    public RoleColumnSchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    """
                    SELECT DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'users'
                      AND COLUMN_NAME = 'role'
                    """);

            if (rows.isEmpty()) {
                return;
            }

            Map<String, Object> row = rows.get(0);
            String dataType = toLower(row.get("DATA_TYPE"));
            String columnType = toLower(row.get("COLUMN_TYPE"));
            boolean nullable = "yes".equals(toLower(row.get("IS_NULLABLE")));
            Integer maxLength = asInteger(row.get("CHARACTER_MAXIMUM_LENGTH"));

            if ("enum".equals(dataType)) {
                boolean hasSecurity = columnType != null && columnType.contains("'security'");
                if (!hasSecurity || nullable) {
                    jdbcTemplate.execute(
                            "ALTER TABLE users MODIFY COLUMN role ENUM('USER','TECHNICIAN','SECURITY','ADMIN') NOT NULL");
                    log.info("Updated users.role enum to include SECURITY.");
                }
                return;
            }

            if (("varchar".equals(dataType) || "char".equals(dataType))
                    && (maxLength == null || maxLength < "SECURITY".length() || nullable)) {
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(32) NOT NULL");
                log.info("Expanded users.role column to VARCHAR(32) NOT NULL.");
            }
        } catch (Exception ex) {
            // Do not block app startup due to best-effort schema compatibility.
            log.warn("Skipping users.role schema compatibility update: {}", ex.getMessage());
        }
    }

    private static String toLower(Object value) {
        return value == null ? null : String.valueOf(value).toLowerCase(Locale.ROOT);
    }

    private static Integer asInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
