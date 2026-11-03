package com.kisanmandi.event;

import com.kisanmandi.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PasswordChangedEventListener {

    private static final Logger log = LoggerFactory.getLogger(PasswordChangedEventListener.class);

    private final EmailService emailService;

    public PasswordChangedEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async("mailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onPasswordChanged(PasswordChangedEvent event) {
        log.info("PasswordChangedEvent: userId={}, requestId={}", event.userId(), event.requestId());
        if (event.email() != null && !event.email().isBlank()) {
            emailService.sendPasswordChanged(event.email(), event.recipientName(), event.lang());
        }
    }
}
