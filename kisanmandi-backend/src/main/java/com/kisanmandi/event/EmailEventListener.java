package com.kisanmandi.event;

import com.kisanmandi.entity.Order;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.entity.User;
import com.kisanmandi.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class EmailEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmailEventListener.class);

    private final EmailService emailService;

    @Value("${app.mail.order-emails-enabled:true}")
    private boolean orderEmailsEnabled;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
            default -> {}
        }
    }

    @Async("mailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onOrderPlaced(OrderPlacedEvent event) {
        if (!orderEmailsEnabled || !emailService.isEmailEnabled()) {
            return;
        }
        Order order = event.order();
        if (order == null) return;

        // Customer email
        User customer = order.getCustomer();
        if (customer != null && customer.isEmailVerified() && customer.getEmail() != null) {
            String trackingLink = frontendUrl + "/customer/orders/" + order.getId();
            emailService.sendOrderPlaced(
                    customer.getEmail(),
                    customer.getName(),
                    order.getId(),
                    order.getTotalAmount(),
                    trackingLink,
                    customer.getPreferredLanguage()
            );
        }

        // Farmer email
        User farmer = order.getFarmer();
        if (farmer != null && farmer.isEmailVerified() && farmer.getEmail() != null) {
            String farmerLink = frontendUrl + "/farmer/orders";
            emailService.sendNewOrderForFarmer(
                    farmer.getEmail(),
                    farmer.getName(),
                    order.getId(),
                    customer != null ? customer.getName() : "Customer",
                    order.getTotalAmount(),
                    farmerLink,
                    farmer.getPreferredLanguage()
            );
        }
    }

    @Async("mailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        if (!orderEmailsEnabled || !emailService.isEmailEnabled()) {
            return;
        }
        Order order = event.order();
        if (order == null) return;

        User customer = order.getCustomer();
        if (customer == null || !customer.isEmailVerified() || customer.getEmail() == null) {
            return;
        }

        OrderStatus to = event.to();
        if (to == OrderStatus.ACCEPTED || to == OrderStatus.OUT_FOR_DELIVERY ||
                to == OrderStatus.DELIVERED || to == OrderStatus.REJECTED || to == OrderStatus.CANCELLED) {
            String trackingLink = frontendUrl + "/customer/orders/" + order.getId();
            emailService.sendOrderStatusUpdate(
                    customer.getEmail(),
                    customer.getName(),
                    order.getId(),
                    to,
                    event.note(),
                    trackingLink,
                    customer.getPreferredLanguage()
            );
        }
    }
}


