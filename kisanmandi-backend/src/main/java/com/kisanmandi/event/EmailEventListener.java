package com.kisanmandi.event;

import com.kisanmandi.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class EmailEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmailEventListener.class);

    private final EmailService emailService;

    public EmailEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async("mailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onEmailEvent(SendEmailEvent event) {
        log.debug("Processing email event type={} for recipient (masked)", event.type());
        switch (event.type()) {
            case VERIFY_EMAIL -> emailService.sendEmailVerification(
                    event.toEmail(),
                    event.recipientName(),
                    event.link(),
                    event.lang()
            );
            case RESET_PASSWORD -> emailService.sendPasswordReset(
                    event.toEmail(),
                    event.recipientName(),
                    event.link(),
                    event.lang()
            );
            case PASSWORD_CHANGED -> emailService.sendPasswordChanged(
                    event.toEmail(),
                    event.recipientName(),
                    event.lang()
            );
        }
    }
}

