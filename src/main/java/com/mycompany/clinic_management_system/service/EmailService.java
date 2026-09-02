package com.mycompany.clinic_management_system.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendRegistrationWelcomeEmail(String toEmail, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@clinicmanagement.com");
        message.setTo(toEmail);
        message.setSubject("Welcome to Sunrise Dental Clinic");
        message.setText("Dear " + username + ",\n\n" +
                "Welcome to Sunrise Dental Clinic! Your account has been successfully created.\n\n" +
                "Thank you for choosing us.\n\n" +
                "Best Regards,\nSunrise Dental Clinic Team");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
