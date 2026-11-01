package com.kisanmandi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemInfoResponse {
    private long uptimeMs;
    private String uptimeFormatted;
    private String appVersion;
    private String activeProfile;
    private String databaseStatus;
    private Map<String, Object> jvmMemory;
    private Map<String, Object> lastMandiSync;
}
