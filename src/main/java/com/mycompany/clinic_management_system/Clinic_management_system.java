package com.mycompany.clinic_management_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class Clinic_management_system {

    public static void main(String[] args) {
        SpringApplication.run(Clinic_management_system.class, args);
    }
}
