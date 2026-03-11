package com.smartexport.platform.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    // Informations personnelles
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String birthDate;
    
    // Informations professionnelles
    private String companyName;
    private String country;
    private String role;
}
