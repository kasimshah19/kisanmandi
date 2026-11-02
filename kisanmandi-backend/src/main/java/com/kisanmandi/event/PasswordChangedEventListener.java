package com.kisanmandi.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class PasswordChangedEventListener {

    private static final Logger log = LoggerFactory.getLogger(PasswordChangedEventListener.class);

    @EventListener
    public void onPasswordChanged(PasswordChangedEvent event) {
        log.info("PasswordChangedEvent: userId={}, requestId={}", event.userId(), event.requestId());
    }
}

