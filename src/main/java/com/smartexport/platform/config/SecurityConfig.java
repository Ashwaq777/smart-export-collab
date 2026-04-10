package com.smartexport.platform.config;

import com.smartexport.platform.repository.UserRepository;
import com.smartexport.platform.security.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserRepository userRepository) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ✅ AUTH
                .requestMatchers("/api/auth/**").permitAll()

                // ✅ EMAIL (AJOUT IMPORTANT)
                .requestMatchers("/send-distance-email").permitAll()

                // ✅ PUBLIC APIs
                .requestMatchers("/api/traceability/**").permitAll()
                .requestMatchers("/api/calculation/**").permitAll()
                .requestMatchers("/api/pdf/**").permitAll()
                .requestMatchers("/api/forex/**").permitAll()
                .requestMatchers("/api/countries/**").permitAll()
                .requestMatchers("/api/ports/**").permitAll()

                // ✅ ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/recent-transactions").permitAll()

                // ✅ USER
                .requestMatchers("/api/users/me/**").authenticated()

                // ✅ WEBSOCKET
                .requestMatchers("/ws/**").permitAll()

                // ✅ VESSELS
                .requestMatchers("/api/v1/vessels/**").authenticated()

                // ✅ CONTAINERS
                .requestMatchers(HttpMethod.GET, "/api/v1/containers/offers").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/containers/offers/{id}").permitAll()
                .requestMatchers("/api/v1/containers/offers/images/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/containers/offers/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/containers/offers/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/containers/requests/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/containers/requests/**").authenticated()
                .requestMatchers("/api/v1/containers/direct-requests/**").authenticated()

                // ✅ SUPPORT
                .requestMatchers("/api/v1/support/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/support/**").authenticated()

                // ✅ ROLES
                .requestMatchers("/api/v1/eir/**").hasAnyRole("IMPORTATEUR", "EXPORTATEUR")
                .requestMatchers("/api/v1/containers/transactions/**").hasAnyRole("IMPORTATEUR", "EXPORTATEUR")
                .requestMatchers(HttpMethod.PUT, "/api/v1/containers/transactions/*/advance-status")
                    .hasAnyRole("IMPORTATEUR", "EXPORTATEUR")

                // ✅ OTHER
                .requestMatchers("/api/v1/carbon/**").authenticated()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/v1/containers/**").authenticated()

                .requestMatchers("/api/users/me").authenticated()
                .requestMatchers("/api/users/me/**").authenticated()

                // 🔐 DEFAULT
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            var user = userRepository.findByEmail(username)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found: " + username));

            return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization","Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}