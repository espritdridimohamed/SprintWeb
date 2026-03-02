package agrismart.agrismart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class VerificationEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public VerificationEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSignupCode(String toEmail, String code) {
        String subject = "AgriSmart - Email Verification Code";
        String body = "Your AgriSmart verification code is: " + code + "\n\n"
            + "This code expires in 10 minutes.";
        sendMail(toEmail, subject, body);
    }

    public void sendPasswordResetCode(String toEmail, String code) {
        String subject = "AgriSmart - Password Reset Code";
        String body = "Your AgriSmart password reset code is: " + code + "\n\n"
            + "This code expires in 10 minutes.";
        sendMail(toEmail, subject, body);
    }

    private void sendMail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            throw new RuntimeException("EMAIL_SEND_FAILED");
        }
    }
}
