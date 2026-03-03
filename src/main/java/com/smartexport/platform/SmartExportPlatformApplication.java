package com.smartexport.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SmartExportPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartExportPlatformApplication.class, args);
    }
}
