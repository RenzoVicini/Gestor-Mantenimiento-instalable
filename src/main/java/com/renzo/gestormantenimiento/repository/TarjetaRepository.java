package com.renzo.gestormantenimiento.repository;

import com.renzo.gestormantenimiento.model.EstadoTarjeta;
import com.renzo.gestormantenimiento.model.Tarjeta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TarjetaRepository extends JpaRepository<Tarjeta, Long> {
    List<Tarjeta> findByEstadoOrderByFechaCreacionAsc(EstadoTarjeta estado);
    List<Tarjeta> findByEstadoOrderByFechaProgramadaAsc(EstadoTarjeta estado);
    List<Tarjeta> findByEstadoOrderByFechaCierreDesc(EstadoTarjeta estado);
}