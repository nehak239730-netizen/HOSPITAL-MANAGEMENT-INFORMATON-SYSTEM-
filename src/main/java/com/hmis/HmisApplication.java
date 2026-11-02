package com.hmis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HmisApplication {

    public static void main(String[] args) {
        SpringApplication.run(HmisApplication.class, args);
        System.out.println("=========================================================");
        System.out.println("  🏥 HMIS Java Backend & MySQL Database System Started!  ");
        System.out.println("  Access Website: http://localhost:8081/                 ");
        System.out.println("  REST API Base:  http://localhost:8081/api              ");
        System.out.println("=========================================================");
    }
}
