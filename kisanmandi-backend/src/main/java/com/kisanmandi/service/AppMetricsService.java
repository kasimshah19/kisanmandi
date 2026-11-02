package com.kisanmandi.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class AppMetricsService {

    private final MeterRegistry meterRegistry;

    public AppMetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void incrementOrdersPlaced(String paymentMode) {
        Counter.builder("orders_placed_total")
                .description("Total number of orders placed")
                .tag("payment_mode", paymentMode != null ? paymentMode : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementOrderStatusChanges(String toStatus) {
        Counter.builder("order_status_changes_total")
                .description("Total order status transitions")
                .tag("to", toStatus != null ? toStatus : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementCheckoutFailures(String reason) {
        Counter.builder("checkout_failures_total")
                .description("Total checkout / order placement failures")
                .tag("reason", reason != null ? reason : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementAuthLogin(String result) {
        Counter.builder("auth_login_total")
                .description("Total login attempts")
                .tag("result", result != null ? result : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementAuthRefresh(String result) {
        Counter.builder("auth_refresh_total")
                .description("Total token refresh requests")
                .tag("result", result != null ? result : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementAuthRefreshReuse() {
        Counter.builder("auth_refresh_reuse_total")
                .description("Total detected refresh token reuses")
                .register(meterRegistry)
                .increment();
    }

    public void recordMandiSync(long durationMs, String status) {
        Timer.builder("mandi_sync_duration")
                .description("Duration of mandi prices synchronization")
                .register(meterRegistry)
                .record(durationMs, TimeUnit.MILLISECONDS);

        Counter.builder("mandi_sync_runs_total")
                .description("Total mandi prices sync runs")
                .tag("status", status != null ? status : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementEmailSent(String result) {
        Counter.builder("email_sent_total")
                .description("Total email sending attempts")
                .tag("result", result != null ? result : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void incrementPaymentVerifications(String result) {
        Counter.builder("payment_verifications_total")
                .description("Total payment verification attempts")
                .tag("result", result != null ? result : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public MeterRegistry getMeterRegistry() {
        return meterRegistry;
    }
}
