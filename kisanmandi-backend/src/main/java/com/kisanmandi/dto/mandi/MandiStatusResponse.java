package com.kisanmandi.dto.mandi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MandiStatusResponse {
    private LocalDate latestPriceDate;
    private long totalRows;
    private SyncLogResponse lastSync;
    private boolean running;
}
