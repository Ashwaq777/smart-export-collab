package com.smartexport.platform.service;


import org.springframework.stereotype.Service;

@Service
public class UserRequestService {

    private String imo;
    private String place;
    private String email;
    private String apiKey;

    public void saveRequest(String imo, String place, String email, String apiKey) {
        this.imo = imo;
        this.place = place;
        this.email = email;
        this.apiKey = apiKey;
    }

    public String getImo() {
        return imo;
    }

    public String getPlace() {
        return place;
    }

    public String getEmail() {
        return email;
    }

    public String getApiKey() {
        return apiKey;
    }

    public boolean hasRequest() {
        return imo != null && place != null && email != null;
    }
}