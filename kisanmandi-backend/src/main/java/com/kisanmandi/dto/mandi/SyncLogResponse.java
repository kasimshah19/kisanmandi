package com.kisanmandi.dto.mandi;

import com.kisanmandi.entity.SyncStatus;
import com.kisanmandi.entity.SyncTrigger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncLogResponse {
    private Long id;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private SyncStatus status;
    private SyncTrigger triggerSource;
    private int recordsFetched;
    private int recordsInserted;
    private int recordsUpdated;
    private int recordsSkipped;
    private Long durationMs;
    private String errorMessage;
    private String details;
}
