package com.kisanmandi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KisanMandiApplication {

	public static void main(String[] args) {
		SpringApplication.run(KisanMandiApplication.class, args);
	}

}
