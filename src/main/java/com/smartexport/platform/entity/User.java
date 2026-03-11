package com.smartexport.platform.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "failed_attempts")
    private Integer failedAttempts;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Nouveaux champs pour l'inscription complète
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @Column(name = "company_name")
    private String companyName;
    
    @Column(name = "country")
    private String country;
    
    // Constructeurs
    public User() {}
    
    public User(Long id, String email, String passwordHash, Role role, UserStatus status, 
                Integer failedAttempts, LocalDateTime lockTime, LocalDateTime createdAt, 
                LocalDateTime lastLogin) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
        this.failedAttempts = failedAttempts;
        this.lockTime = lockTime;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
    }
    
    // Getters existants
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public UserStatus getStatus() { return status; }
    public Integer getFailedAttempts() { return failedAttempts; }
    public LocalDateTime getLockTime() { return lockTime; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    
    // Setters existants
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(Role role) { this.role = role; }
    public void setStatus(UserStatus status) { this.status = status; }
    public void setFailedAttempts(Integer failedAttempts) { this.failedAttempts = failedAttempts; }
    public void setLockTime(LocalDateTime lockTime) { this.lockTime = lockTime; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    
    // Getters pour les nouveaux champs (manuels)
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getPhone() { return phone; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getCompanyName() { return companyName; }
    public String getCountry() { return country; }
    
    // Setters pour les nouveaux champs (manuels)
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public void setCountry(String country) { this.country = country; }
}
