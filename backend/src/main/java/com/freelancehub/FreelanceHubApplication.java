package com.freelancehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FreelanceHubApplication {
    public static final String VERSION = "1.0.0";
    public static void main(String[] args) {
        SpringApplication.run(FreelanceHubApplication.class, args);
    }
}
