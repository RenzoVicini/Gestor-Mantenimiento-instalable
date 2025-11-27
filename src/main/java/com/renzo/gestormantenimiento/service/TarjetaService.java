package com.renzo.gestormantenimiento.service;

import com.renzo.gestormantenimiento.model.Tarjeta;
import com.renzo.gestormantenimiento.model.EstadoTarjeta;

import java.time.LocalDateTime;
import java.util.List;

public interface TarjetaService {

    Tarjeta crearTarjeta(Tarjeta tarjeta);

    List<Tarjeta> listarPorEstado(EstadoTarjeta estado);

    Tarjeta programarMantenimiento(Long id, LocalDateTime fecha);

    Tarjeta reprogramarFecha(Long id, LocalDateTime fecha);

    Tarjeta cerrarTarjeta(Long id, String motivo, String mecanico);
}
