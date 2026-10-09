package com.kisanmandi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mandi_sync_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MandiSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private SyncStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private SyncTrigger triggerSource;

    private int recordsFetched;
    private int recordsInserted;
    private int recordsUpdated;
    private int recordsSkipped;
    private Long durationMs;

    @Column(length = 1000)
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String details;
    
    @PrePersist
    public void prePersist() {
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
    }
}
