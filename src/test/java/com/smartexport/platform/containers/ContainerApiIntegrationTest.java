package com.smartexport.platform.containers;

import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerRequestRepository;
import com.smartexport.platform.entity.Role;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.entity.UserStatus;
import com.smartexport.platform.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ContainerApiIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ContainerOfferRepository offerRepository;

    @Autowired
    private ContainerRequestRepository requestRepository;

    @Autowired
    private ContainerMatchRepository matchRepository;

    private static String importateurToken;
    private static String exportateurToken;
    private static Long offerId;
    private static Long requestId;
    private static Long matchId;

    @BeforeEach
    void setupUsers() {
        // Create importateur if not exists
        if (!userRepository.findByEmail("test.imp@test.com").isPresent()) {
            User imp = new User();
            imp.setEmail("test.imp@test.com");
            imp.setPasswordHash(passwordEncoder.encode("Test1234!"));
            imp.setFirstName("Test");
            imp.setLastName("Importateur");
            imp.setRole(Role.IMPORTATEUR);
            imp.setStatus(UserStatus.ACTIVE);
            imp.setFailedAttempts(0);
            imp.setCreatedAt(LocalDateTime.now());
            userRepository.save(imp);
        }
        // Create exportateur if not exists
        if (!userRepository.findByEmail("test.exp@test.com").isPresent()) {
            User exp = new User();
            exp.setEmail("test.exp@test.com");
            exp.setPasswordHash(passwordEncoder.encode("Test1234!"));
            exp.setFirstName("Test");
            exp.setLastName("Exportateur");
            exp.setRole(Role.EXPORTATEUR);
            exp.setStatus(UserStatus.ACTIVE);
            exp.setFailedAttempts(0);
            exp.setCreatedAt(LocalDateTime.now());
            userRepository.save(exp);
        }
    }

    private String getToken(String email, String password) {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", email);
        loginRequest.put("password", password);
        ResponseEntity<Map> response = restTemplate.postForEntity(
            "/api/auth/login", loginRequest, Map.class);
        return (String) response.getBody().get("token");
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Test
    @Order(1)
    void test1_LoginBothUsers() {
        importateurToken = getToken("test.imp@test.com", "Test1234!");
        exportateurToken = getToken("test.exp@test.com", "Test1234!");
        
        assertThat(importateurToken).isNotNull().isNotBlank();
        assertThat(exportateurToken).isNotNull().isNotBlank();
        System.out.println("✅ Both users logged in");
    }

    @Test
    @Order(2)
    void test2_CreateOffer() {
        importateurToken = getToken("test.imp@test.com", "Test1234!");
        
        Map<String, Object> offerData = new HashMap<>();
        offerData.put("containerType", "HIGH_CUBE_40");
        offerData.put("cargoType", "DRY");
        offerData.put("location", "Port of Rotterdam");
        offerData.put("latitude", 51.9225);
        offerData.put("longitude", 4.4792);
        offerData.put("availableDate", "2026-06-01");

        HttpEntity<Map<String, Object>> request = 
            new HttpEntity<>(offerData, authHeaders(importateurToken));
        
        ResponseEntity<Map> response = restTemplate.postForEntity(
            "/api/v1/containers/offers", request, Map.class);
        
        assertThat(response.getStatusCode().value()).isEqualTo(201);
        Map data = (Map) response.getBody().get("data");
        offerId = Long.valueOf(data.get("id").toString());
        assertThat(offerId).isNotNull();
        System.out.println("✅ Offer created: " + offerId);
    }

    @Test
    @Order(3)
    void test3_CreateRequest() {
        exportateurToken = getToken("test.exp@test.com", "Test1234!");
        
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("containerType", "HIGH_CUBE_40");
        requestData.put("cargoType", "DRY");
        requestData.put("loadingLocation", "Port of Hamburg");
        requestData.put("loadingLatitude", 53.5753);
        requestData.put("loadingLongitude", 10.0153);
        requestData.put("requiredDate", "2026-07-01");

        HttpEntity<Map<String, Object>> req =
            new HttpEntity<>(requestData, authHeaders(exportateurToken));

        ResponseEntity<Map> response = restTemplate.postForEntity(
            "/api/v1/containers/requests", req, Map.class);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        Map data = (Map) response.getBody().get("data");
        requestId = Long.valueOf(data.get("id").toString());
        assertThat(requestId).isNotNull();
        System.out.println("✅ Request created: " + requestId);
    }

    @Test
    @Order(4)
    void test4_TriggerMatchmaking() {
        exportateurToken = getToken("test.exp@test.com", "Test1234!");
        
        // Need requestId from test3
        var requests = requestRepository.findAll();
        assertThat(requests).isNotEmpty();
        requestId = requests.get(requests.size()-1).getId();

        HttpEntity<Void> req = 
            new HttpEntity<>(authHeaders(exportateurToken));

        ResponseEntity<Map> response = restTemplate.exchange(
            "/api/v1/containers/requests/" + requestId + "/match",
            HttpMethod.POST, req, Map.class);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        List matches = (List) response.getBody().get("data");
        assertThat(matches).isNotEmpty();
        matchId = Long.valueOf(
            ((Map)matches.get(0)).get("id").toString());
        System.out.println("✅ Matches found: " + matches.size() 
            + " matchId: " + matchId);
    }

    @Test
    @Order(5)
    void test5_ConfirmMatchBothSides() {
        importateurToken = getToken("test.imp@test.com", "Test1234!");
        exportateurToken = getToken("test.exp@test.com", "Test1234!");

        // Get match ID
        var matches = matchRepository.findAll();
        assertThat(matches).isNotEmpty();
        matchId = matches.get(matches.size()-1).getId();

        // Confirm as exportateur
        HttpEntity<Void> expReq = 
            new HttpEntity<>(authHeaders(exportateurToken));
        ResponseEntity<Map> expRes = restTemplate.exchange(
            "/api/v1/containers/matches/" + matchId + "/confirm",
            HttpMethod.POST, expReq, Map.class);
        assertThat(expRes.getStatusCode().is2xxSuccessful()).isTrue();

        // Confirm as importateur
        HttpEntity<Void> impReq = 
            new HttpEntity<>(authHeaders(importateurToken));
        ResponseEntity<Map> impRes = restTemplate.exchange(
            "/api/v1/containers/matches/" + matchId + "/confirm",
            HttpMethod.POST, impReq, Map.class);
        assertThat(impRes.getStatusCode().is2xxSuccessful()).isTrue();

        System.out.println("✅ Match confirmed by both parties");
    }

    @Test
    @Order(6)
    void test6_VerifyDashboard() {
        exportateurToken = getToken("test.exp@test.com", "Test1234!");

        HttpEntity<Void> req = 
            new HttpEntity<>(authHeaders(exportateurToken));
        ResponseEntity<Map> response = restTemplate.exchange(
            "/api/v1/containers/dashboard",
            HttpMethod.GET, req, Map.class);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        System.out.println("✅ Dashboard accessible");
        System.out.println("✅ FULL INTEGRATION TEST PASSED");
    }
}
