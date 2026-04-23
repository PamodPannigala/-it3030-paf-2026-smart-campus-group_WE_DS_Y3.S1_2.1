package com.campus.hub.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for sending emails asynchronously to minimize notification lag.
 */
@Service
public class EmailService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(EmailService.class);


    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    /**
     * Sends a simple text email.
     *
     * @param to the recipient email address
     * @param subject the email subject
     * @param body the email body
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        log.info("Attempting to send email to: {}", to);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // Using the configured username as the from address for Gmail compatibility
            message.setFrom(mailSender instanceof org.springframework.mail.javamail.JavaMailSenderImpl ? ((org.springframework.mail.javamail.JavaMailSenderImpl) mailSender).getUsername() : "campushub-notifications@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            log.info("SUCCESS: Email sent to {}", to);
        } catch (Exception e) {
            log.error("CRITICAL ERROR: Failed to send email to {}", to);
            log.error("Error type: {}, Message: {}", e.getClass().getName(), e.getMessage());
        }
    }
}
