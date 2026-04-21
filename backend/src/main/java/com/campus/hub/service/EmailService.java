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
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@campushub.local");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }
}
