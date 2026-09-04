package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.model.Role;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Dispatches login credentials to the user's email based on their assigned role.
     */
    @Async
    public void sendRegistrationCredentialsEmail(String toEmail, String username, String rawPassword, Role role) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            log.warn("Cannot send credentials email: email address is empty for user {}", username);
            return;
        }

        if (role == Role.PATIENT) {
            sendPatientRegistrationEmail(toEmail, username, rawPassword);
        } else if (role == Role.DOCTOR) {
            sendDoctorRegistrationEmail(toEmail, username, rawPassword);
        } else {
            sendStaffRegistrationEmail(toEmail, username, rawPassword);
        }
    }

    /**
     * Sends doctor portal login credentials using the dentist-specific email template.
     */
    @Async
    public void sendDoctorRegistrationEmail(String toEmail, String username, String rawPassword) {
        String subject = "🦷 Sunrise Dental Clinic - Dentist / Doctor Clinical Portal Credentials";
        String htmlContent = buildDoctorEmailHtml(username, rawPassword);
        String textContent = buildDoctorEmailText(username, rawPassword);
        sendMimeEmail(toEmail, subject, htmlContent, textContent);
    }

    /**
     * Sends patient portal login credentials using the patient-specific email template.
     */
    @Async
    public void sendPatientRegistrationEmail(String toEmail, String username, String rawPassword) {
        String subject = "🦷 Sunrise Dental Clinic - Your Patient Portal Login Credentials";
        String htmlContent = buildPatientEmailHtml(username, rawPassword);
        String textContent = buildPatientEmailText(username, rawPassword);
        sendMimeEmail(toEmail, subject, htmlContent, textContent);
    }

    /**
     * Sends staff portal login credentials using the staff-specific email template.
     */
    @Async
    public void sendStaffRegistrationEmail(String toEmail, String username, String rawPassword) {
        String subject = "🏥 Sunrise Dental Clinic - Staff Portal Account Credentials";
        String htmlContent = buildStaffEmailHtml(username, rawPassword);
        String textContent = buildStaffEmailText(username, rawPassword);
        sendMimeEmail(toEmail, subject, htmlContent, textContent);
    }

    /**
     * Legacy welcome email kept for backward compatibility.
     */
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
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendMimeEmail(String toEmail, String subject, String htmlContent, String textContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@sunrisedental.com");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(textContent, htmlContent);

            mailSender.send(message);
            log.info("Successfully sent email to {} with subject: '{}'", toEmail, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    // Patient email templates


    private String buildPatientEmailHtml(String username, String password) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<style>"
                + "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }"
                + "  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }"
                + "  .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px 24px; text-align: center; color: #ffffff; }"
                + "  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }"
                + "  .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }"
                + "  .body { padding: 32px 28px; }"
                + "  .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }"
                + "  .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }"
                + "  .credentials-box { background: #f8fafc; border: 2px solid #0ea5e9; border-radius: 12px; padding: 20px; margin-bottom: 24px; }"
                + "  .credentials-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0284c7; letter-spacing: 0.5px; margin-bottom: 12px; }"
                + "  .cred-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }"
                + "  .cred-label { color: #64748b; font-weight: 500; }"
                + "  .cred-val { color: #0f172a; font-weight: 700; font-family: monospace; font-size: 15px; background: #e0f2fe; padding: 2px 8px; border-radius: 6px; }"
                + "  .features { background: #f1f5f9; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; }"
                + "  .features h4 { margin: 0 0 10px 0; font-size: 14px; color: #334155; }"
                + "  .features ul { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7; }"
                + "  .btn-wrap { text-align: center; margin: 28px 0; }"
                + "  .btn { display: inline-block; background: #0284c7; color: #ffffff !important; padding: 12px 32px; font-size: 14px; font-weight: 600; border-radius: 8px; text-decoration: none; }"
                + "  .security-notice { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; }"
                + "  .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "  <div class='card'>"
                + "    <div class='header'>"
                + "      <h1>🦷 Sunrise Dental Clinic</h1>"
                + "      <p>Patient Portal Access & Account Notification</p>"
                + "    </div>"
                + "    <div class='body'>"
                + "      <div class='greeting'>Dear " + username + ",</div>"
                + "      <div class='intro'>"
                + "        Welcome to <strong>Sunrise Dental Clinic</strong>! Your patient portal account has been created by our clinic reception. "
                + "        You can now sign in to view your scheduled dental appointments, access treatment summaries, and view billing receipts."
                + "      </div>"
                + "      <div class='credentials-box'>"
                + "        <div class='credentials-title'>🔑 Your Patient Login Credentials</div>"
                + "        <div class='cred-row'><span class='cred-label'>Username:</span> <span class='cred-val'>" + username + "</span></div>"
                + "        <div class='cred-row'><span class='cred-label'>Temporary Password:</span> <span class='cred-val'>" + password + "</span></div>"
                + "        <div class='cred-row'><span class='cred-label'>Account Role:</span> <span class='cred-val'>PATIENT</span></div>"
                + "      </div>"
                + "      <div class='features'>"
                + "        <h4>✨ What you can do on your Patient Portal:</h4>"
                + "        <ul>"
                + "          <li><strong>Appointment Lookup:</strong> Search and view your upcoming dental appointment timings.</li>"
                + "          <li><strong>Invoices & Receipts:</strong> View treatment charges, consultation fees, and payment status.</li>"
                + "          <li><strong>Dental Care Guide:</strong> Access clinic assistance and dental hygiene instructions.</li>"
                + "        </ul>"
                + "      </div>"
                + "      <div class='btn-wrap'>"
                + "        <a href='http://localhost:8190' class='btn'>Sign In to Patient Portal</a>"
                + "      </div>"
                + "      <div class='security-notice'>"
                + "        🔒 <strong>Security Tip:</strong> Please keep your login credentials private. If you did not request this account, please contact our clinic immediately."
                + "      </div>"
                + "    </div>"
                + "    <div class='footer'>"
                + "      Sunrise Dental Clinic &bull; No. 45 Galle Road, Colombo 03, Sri Lanka<br>"
                + "      Hotline: +94 11 234 5678 &bull; Email: info@sunrisedental.com"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildPatientEmailText(String username, String password) {
        return "Dear " + username + ",\n\n"
                + "Welcome to Sunrise Dental Clinic!\n\n"
                + "Your patient portal account has been registered by our clinic administration.\n\n"
                + "YOUR LOGIN CREDENTIALS:\n"
                + "----------------------------------------\n"
                + "Username: " + username + "\n"
                + "Temporary Password: " + password + "\n"
                + "Role: PATIENT\n"
                + "Portal Login URL: http://localhost:8190\n"
                + "----------------------------------------\n\n"
                + "With your patient portal account, you can:\n"
                + " - Search and check your dental appointment schedule\n"
                + " - View treatment costs and billing receipts\n"
                + " - Access clinic help and dental hygiene guidance\n\n"
                + "Please keep your password secure.\n\n"
                + "Best Regards,\n"
                + "Sunrise Dental Clinic Team\n"
                + "No. 45 Galle Road, Colombo 03\n"
                + "Tel: +94 11 234 5678";
    }

    // Staff email templates


    private String buildStaffEmailHtml(String username, String password) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<style>"
                + "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }"
                + "  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }"
                + "  .header { background: linear-gradient(135deg, #4f46e5, #3730a3); padding: 32px 24px; text-align: center; color: #ffffff; }"
                + "  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }"
                + "  .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }"
                + "  .body { padding: 32px 28px; }"
                + "  .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }"
                + "  .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }"
                + "  .credentials-box { background: #f5f3ff; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; margin-bottom: 24px; }"
                + "  .credentials-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.5px; margin-bottom: 12px; }"
                + "  .cred-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }"
                + "  .cred-label { color: #64748b; font-weight: 500; }"
                + "  .cred-val { color: #0f172a; font-weight: 700; font-family: monospace; font-size: 15px; background: #ede9fe; padding: 2px 8px; border-radius: 6px; }"
                + "  .features { background: #f8fafc; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }"
                + "  .features h4 { margin: 0 0 10px 0; font-size: 14px; color: #334155; }"
                + "  .features ul { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7; }"
                + "  .btn-wrap { text-align: center; margin: 28px 0; }"
                + "  .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 32px; font-size: 14px; font-weight: 600; border-radius: 8px; text-decoration: none; }"
                + "  .security-notice { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; }"
                + "  .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "  <div class='card'>"
                + "    <div class='header'>"
                + "      <h1>🏥 Sunrise Dental Clinic</h1>"
                + "      <p>Staff & Clinical Operations Portal</p>"
                + "    </div>"
                + "    <div class='body'>"
                + "      <div class='greeting'>Dear " + username + ",</div>"
                + "      <div class='intro'>"
                + "        An authorized staff account has been created for you by the <strong>Clinic Administrator</strong>. "
                + "        You now have access to the Sunrise Dental Clinic Management System to assist patients and handle clinical workflows."
                + "      </div>"
                + "      <div class='credentials-box'>"
                + "        <div class='credentials-title'>🛡️ Your Staff Login Credentials</div>"
                + "        <div class='cred-row'><span class='cred-label'>Staff Username:</span> <span class='cred-val'>" + username + "</span></div>"
                + "        <div class='cred-row'><span class='cred-label'>Assigned Password:</span> <span class='cred-val'>" + password + "</span></div>"
                + "        <div class='cred-row'><span class='cred-label'>System Role:</span> <span class='cred-val'>STAFF (Receptionist)</span></div>"
                + "      </div>"
                + "      <div class='features'>"
                + "        <h4>📋 Staff System Privileges & Workflows:</h4>"
                + "        <ul>"
                + "          <li><strong>Clinic Dashboard:</strong> Monitor appointments, patient flows, and clinic metrics.</li>"
                + "          <li><strong>Appointment Registration:</strong> Register patients, assign dental surgeons, and schedule treatments.</li>"
                + "          <li><strong>Billing & Invoicing:</strong> Calculate consultation fees, apply treatment charges, and print receipts.</li>"
                + "          <li><strong>Staff Guide:</strong> Access Standard Operating Procedures (SOP) and dental pricing schedules.</li>"
                + "        </ul>"
                + "      </div>"
                + "      <div class='btn-wrap'>"
                + "        <a href='http://localhost:8190' class='btn'>Open Staff Portal</a>"
                + "      </div>"
                + "      <div class='security-notice'>"
                + "        ⚠️ <strong>Confidentiality Notice:</strong> This account gives access to confidential healthcare records. "
                + "        Never share your password or leave your terminal unattended while signed in."
                + "      </div>"
                + "    </div>"
                + "    <div class='footer'>"
                + "      Sunrise Dental Clinic Administration &bull; Colombo Clinic<br>"
                + "      IT Support: admin@sunrisedental.com"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildStaffEmailText(String username, String password) {
        return "Dear " + username + ",\n\n"
                + "Welcome to the Sunrise Dental Clinic Team!\n\n"
                + "An authorized staff account has been provisioned for you by the Clinic Administrator.\n\n"
                + "YOUR STAFF CREDENTIALS:\n"
                + "----------------------------------------\n"
                + "Staff Username: " + username + "\n"
                + "Assigned Password: " + password + "\n"
                + "System Role: STAFF\n"
                + "Staff Portal URL: http://localhost:8190\n"
                + "----------------------------------------\n\n"
                + "Your Staff Access Privileges:\n"
                + " - Clinic Dashboard & Analytics\n"
                + " - Patient Registration & Appointment Scheduling\n"
                + " - Appointment Lookup & Patient Records\n"
                + " - Billing, Invoicing & Official Receipt Generation\n"
                + " - Staff Guide & Standard Operating Procedures\n\n"
                + "Please maintain strict confidentiality of patient records and your login credentials.\n\n"
                + "Best Regards,\n"
                + "Clinic Administration\n"
                + "Sunrise Dental Clinic";
    }

    // Doctor email templates


    private String buildDoctorEmailHtml(String username, String password) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<style>"
                + "  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }"
                + "  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }"
                + "  .header { background: linear-gradient(135deg, #0d9488, #0284c7); padding: 32px 24px; text-align: center; color: #ffffff; }"
                + "  .header h1 { margin: 0; font-size: 24px; font-weight: 700; }"
                + "  .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }"
                + "  .body { padding: 32px 28px; }"
                + "  .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }"
                + "  .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }"
                + "  .credentials-box { background: #f0fdfa; border: 2px solid #0d9488; border-radius: 12px; padding: 20px; margin-bottom: 24px; }"
                + "  .credentials-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f766e; letter-spacing: 0.5px; margin-bottom: 12px; }"
                + "  .cred-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }"
                + "  .cred-label { color: #64748b; font-weight: 500; }"
                + "  .cred-val { color: #0f172a; font-weight: 700; font-family: monospace; font-size: 15px; background: #ccfbf1; padding: 2px 8px; border-radius: 6px; }"
                + "  .features { background: #f8fafc; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }"
                + "  .features h4 { margin: 0 0 10px 0; font-size: 14px; color: #334155; }"
                + "  .features ul { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7; }"
                + "  .btn-wrap { text-align: center; margin: 28px 0; }"
                + "  .btn { display: inline-block; background: #0d9488; color: #ffffff !important; padding: 12px 32px; font-size: 14px; font-weight: 600; border-radius: 8px; text-decoration: none; }"
                + "  .security-notice { font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; }"
                + "  .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "  <div class='card'>"
                + "    <div class='header'>"
                + "      <h1>🦷 Sunrise Dental Clinic</h1>"
                + "      <p>Doctor / Dentist Clinical Portal Account</p>"
                + "    </div>"
                + "    <div class='body'>"
                + "      <div class='greeting'>Welcome, Dr. " + username + "!</div>"
                + "      <div class='intro'>Your clinical provider account has been initialized by clinic management. You can now access your daily appointment schedule, view assigned patient records, and track treatments through the Doctor Clinical Dashboard.</div>"
                + "      <div class='credentials-box'>"
                + "        <div class='credentials-title'>🔑 Your Clinical Login Credentials</div>"
                + "        <div class='cred-row'><span class='cred-label'>Username:</span><span class='cred-val'>" + username + "</span></div>"
                + "        <div class='cred-row'><span class='cred-label'>Temporary Password:</span><span class='cred-val'>" + password + "</span></div>"
                + "        <div class='cred-row'><span class='cred-label'>System Role:</span><span class='cred-val'>DOCTOR (Dentist)</span></div>"
                + "      </div>"
                + "      <div class='features'>"
                + "        <h4>✨ Your Doctor Clinical Features:</h4>"
                + "        <ul>"
                + "          <li><strong>Doctor Clinical Dashboard:</strong> Real-time view of your assigned patients and consultation schedule.</li>"
                + "          <li><strong>Patient Record Inspection:</strong> Search and inspect dental patient demographics and clinical history.</li>"
                + "          <li><strong>Clinical SOP:</strong> Access dental surgery protocols, standard procedures, and shift guides.</li>"
                + "        </ul>"
                + "      </div>"
                + "      <div class='btn-wrap'>"
                + "        <a href='http://localhost:8190' class='btn'>Open Doctor Clinical Portal</a>"
                + "      </div>"
                + "      <div class='security-notice'>"
                + "        🔒 <strong>Medical Data Confidentiality:</strong> This account contains protected health information. Always sign out after finishing your clinical shift."
                + "      </div>"
                + "    </div>"
                + "    <div class='footer'>"
                + "      Sunrise Dental Clinic &bull; Colombo 03, Sri Lanka<br>"
                + "      Hotline: +94 11 234 5678"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildDoctorEmailText(String username, String password) {
        return "Dear Dr. " + username + ",\n\n"
                + "Welcome to the Sunrise Dental Clinic Clinical Team!\n\n"
                + "Your clinical provider account has been created by the Clinic Administrator.\n\n"
                + "YOUR CLINICAL CREDENTIALS:\n"
                + "----------------------------------------\n"
                + "Username: " + username + "\n"
                + "Temporary Password: " + password + "\n"
                + "Role: DOCTOR\n"
                + "Portal Login URL: http://localhost:8190\n"
                + "----------------------------------------\n\n"
                + "Your Clinical Access Privileges:\n"
                + " - Doctor Clinical Dashboard & Daily Queue\n"
                + " - Assigned Patient Lookup & Medical History\n"
                + " - Treatment Progress & Clinical Notes\n"
                + " - Doctor Clinical Standard Operating Procedures\n\n"
                + "Please maintain confidentiality of patient health records.\n\n"
                + "Best Regards,\n"
                + "Sunrise Dental Clinic Management";
    }
}
