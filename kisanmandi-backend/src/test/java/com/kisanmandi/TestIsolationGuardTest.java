package com.kisanmandi;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class TestIsolationGuardTest {

    private static final Pattern LOCAL_PROFILE_PATTERN = Pattern.compile("@ActiveProfiles\\s*\\(\\s*(\"local\"|value\\s*=\\s*\"local\")\\s*\\)");
    private static final Pattern LOCAL_MYSQL_PATTERN = Pattern.compile("jdbc:mysql://(localhost|127\\.0\\.0\\.1)");
    private static final Pattern REAL_API_PATTERN = Pattern.compile("https?://api\\.data\\.gov\\.in");

    @Test
    void verifyNoTestUsesLocalProfileOrLocalMysqlOrRealNetwork() throws IOException {
        Path testRoot = Paths.get("src", "test");
        assertTrue(Files.exists(testRoot), "src/test must exist");

        List<String> violations = new ArrayList<>();

        try (Stream<Path> stream = Files.walk(testRoot)) {
            stream.filter(Files::isRegularFile)
                    .forEach(path -> {
                        String fileName = path.getFileName().toString();
                        if (fileName.endsWith(".java") || fileName.endsWith(".properties") || fileName.endsWith(".yml") || fileName.endsWith(".yaml")) {
                            // Skip this guard test itself when searching for patterns
                            if (fileName.equals("TestIsolationGuardTest.java")) {
                                return;
                            }
                            try {
                                String content = Files.readString(path);
                                if (LOCAL_PROFILE_PATTERN.matcher(content).find()) {
                                    violations.add("Forbidden @ActiveProfiles(\"local\") found in: " + path);
                                }
                                if (LOCAL_MYSQL_PATTERN.matcher(content).find()) {
                                    violations.add("Forbidden local MySQL connection URL found in: " + path);
                                }
                                if (REAL_API_PATTERN.matcher(content).find()) {
                                    violations.add("Forbidden real government API URL found in: " + path);
                                }
                            } catch (IOException e) {
                                violations.add("Failed to read file " + path + ": " + e.getMessage());
                            }
                        }
                    });
        }

        assertTrue(violations.isEmpty(),
                "Test isolation violations detected:\n" + String.join("\n", violations));
    }
}
