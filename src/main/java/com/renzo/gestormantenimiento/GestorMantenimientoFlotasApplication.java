package com.renzo.gestormantenimiento;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class GestorMantenimientoFlotasApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestorMantenimientoFlotasApplication.class, args);
    }

}
