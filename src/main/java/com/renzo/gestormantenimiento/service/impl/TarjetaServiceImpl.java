package com.renzo.gestormantenimiento.service.impl;

import com.renzo.gestormantenimiento.model.EstadoTarjeta;
import com.renzo.gestormantenimiento.model.Tarjeta;
import com.renzo.gestormantenimiento.repository.TarjetaRepository;
import com.renzo.gestormantenimiento.service.TarjetaService;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TarjetaServiceImpl implements TarjetaService {

    private final TarjetaRepository repository;

    public TarjetaServiceImpl(TarjetaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Tarjeta crearTarjeta(Tarjeta tarjeta) {
        tarjeta.setEstado(EstadoTarjeta.SOLICITUD);
        return repository.save(tarjeta);
    }

    @Override
    public List<Tarjeta> listarPorEstado(EstadoTarjeta estado) {
        switch (estado) {
            case SOLICITUD:
                return repository.findByEstadoOrderByFechaCreacionAsc(estado);
            case PROGRAMADO:
                return repository.findByEstadoOrderByFechaProgramadaAsc(estado);
            case CERRADA:
                return repository.findByEstadoOrderByFechaCierreDesc(estado);
            default:
                throw new IllegalArgumentException("Estado no válido");
        }
    }

    @Override
    public Tarjeta programarMantenimiento(Long id, LocalDateTime fecha) {
        Tarjeta tarjeta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        tarjeta.setFechaProgramada(fecha);
        tarjeta.setEstado(EstadoTarjeta.PROGRAMADO);
        return repository.save(tarjeta);
    }

    @Override
    public Tarjeta reprogramarFecha(Long id, LocalDateTime fecha) {
        Tarjeta tarjeta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        tarjeta.setFechaProgramada(fecha);
        return repository.save(tarjeta);
    }

    @Override
    public Tarjeta cerrarTarjeta(Long id, String motivo, String mecanico) {
        Tarjeta tarjeta = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        tarjeta.setMotivoCierre(motivo);
        tarjeta.setMecanicoResponsable(mecanico);
        tarjeta.setFechaCierre(LocalDateTime.now());
        tarjeta.setEstado(EstadoTarjeta.CERRADA);

        return repository.save(tarjeta);
    }

    @Scheduled(cron = "0 0 0 * * *") // Se ejecuta todos los días a medianoche
    public void cerrarTarjetasVencidas() {
        List<Tarjeta> programadas = repository.findByEstadoOrderByFechaProgramadaAsc(EstadoTarjeta.PROGRAMADO);

        LocalDateTime limite = LocalDateTime.now().minusDays(7);

        for (Tarjeta tarjeta : programadas) {

            // ✅ Aquí va tu condición:
            if (tarjeta.getUltimaActualizacion() != null &&
                    tarjeta.getUltimaActualizacion().isBefore(limite)) {

                tarjeta.setEstado(EstadoTarjeta.CERRADA);
                tarjeta.setMotivoCierre("tarjeta vencida");
                tarjeta.setFechaCierre(LocalDateTime.now());

                repository.save(tarjeta);
            }
        }
    }
}