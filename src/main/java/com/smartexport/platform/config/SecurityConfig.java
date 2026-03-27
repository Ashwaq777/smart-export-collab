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
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/traceability/**").permitAll()
                .requestMatchers("/api/calculation/**").permitAll()
                .requestMatchers("/api/pdf/**").permitAll()
                .requestMatchers("/api/forex/**").permitAll()
                .requestMatchers("/api/countries/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/v1/vessels/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/containers/offers").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/containers/offers/**").permitAll()
                .requestMatchers("/api/v1/containers/offers/images/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/containers/requests/**").authenticated()
                .requestMatchers("/api/v1/containers/direct-requests/**").authenticated()
                .requestMatchers("/api/v1/support/**").authenticated()
                .requestMatchers("/api/v1/eir/**").hasAnyRole("IMPORTATEUR", "EXPORTATEUR")
                .requestMatchers("/api/v1/containers/transactions/**").hasAnyRole("IMPORTATEUR", "EXPORTATEUR")
                .requestMatchers(HttpMethod.GET, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/containers/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/v1/containers/**").authenticated()
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
