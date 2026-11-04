package com.kisanmandi.integration;

import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EnumSchemaParityTest extends MySqlIntegrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Verify all Java enum constants are represented in MySQL ENUM columns")
    void testAllJavaEnumsMatchMySqlSchemaEnums() {
        Map<Class<?>, String> entityTableMap = Map.of(
                com.kisanmandi.entity.User.class, "users",
                com.kisanmandi.entity.FarmerProfile.class, "farmer_profiles",
                com.kisanmandi.entity.Product.class, "products",
                com.kisanmandi.entity.Order.class, "orders",
                com.kisanmandi.entity.OrderItem.class, "order_items",
                com.kisanmandi.entity.OrderStatusHistory.class, "order_status_history",
                com.kisanmandi.entity.MandiPrice.class, "mandi_prices",
                com.kisanmandi.entity.MandiSyncLog.class, "mandi_sync_logs",
                com.kisanmandi.entity.Payment.class, "payments",
                com.kisanmandi.entity.IdempotencyKey.class, "idempotency_keys"
        );

        for (Map.Entry<Class<?>, String> entry : entityTableMap.entrySet()) {
            Class<?> entityClass = entry.getKey();
            String tableName = entry.getValue();

            for (Field field : entityClass.getDeclaredFields()) {
                if (field.isAnnotationPresent(Enumerated.class) && field.getType().isEnum()) {
                    String columnName = getColumnName(field);
                    Class<?> enumType = field.getType();

                    Object[] enumConstants = enumType.getEnumConstants();
                    Set<String> javaEnumNames = new HashSet<>();
                    for (Object constant : enumConstants) {
                        javaEnumNames.add(constant.toString());
                    }

                    String columnType = jdbcTemplate.queryForObject(
                            "SELECT COLUMN_TYPE FROM information_schema.COLUMNS " +
                                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                            String.class,
                            tableName,
                            columnName
                    );

                    assertNotNull(columnType, "Column type should not be null for " + tableName + "." + columnName);
                    Set<String> dbEnumValues = parseEnumValues(columnType);

                    for (String javaEnum : javaEnumNames) {
                        assertTrue(dbEnumValues.contains(javaEnum),
                                String.format("Java enum %s.%s missing from MySQL column %s.%s definition: %s",
                                        enumType.getSimpleName(), javaEnum, tableName, columnName, columnType));
                    }
                }
            }
        }
    }

    private String getColumnName(Field field) {
        if (field.isAnnotationPresent(Column.class)) {
            Column col = field.getAnnotation(Column.class);
            if (!col.name().isEmpty()) {
                return col.name();
            }
        }
        return field.getName().replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }

    private Set<String> parseEnumValues(String columnType) {
        Set<String> values = new HashSet<>();
        Matcher matcher = Pattern.compile("'([^']+)'").matcher(columnType);
        while (matcher.find()) {
            values.add(matcher.group(1));
        }
        return values;
    }
}
