package com.smartexport.platform.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    
    private static final Logger log = 
        LoggerFactory.getLogger(EmailService.class);
    
    public void sendPasswordResetEmail(String email, String resetToken) {
        log.info("Envoi email réinitialisation mot de passe à : {}", email);
        // TODO: implémenter l'envoi réel d'email
    }
    
    public void sendEmail(String to, String subject, String body) {
        log.info("Envoi email à : {} | Sujet : {}", to, subject);
        // TODO: implémenter l'envoi réel d'email
    }
}
