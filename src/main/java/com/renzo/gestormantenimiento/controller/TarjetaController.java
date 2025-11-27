package com.renzo.gestormantenimiento.controller;

import com.renzo.gestormantenimiento.model.EstadoTarjeta;
import com.renzo.gestormantenimiento.model.Tarjeta;
import com.renzo.gestormantenimiento.service.TarjetaService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/tarjetas")
@CrossOrigin(origins = "*") // permite conexión desde el frontend
public class TarjetaController {


    private final TarjetaService service;

    public TarjetaController(TarjetaService service) {
        this.service = service;
    }

    @PostMapping
    public Tarjeta crear(@RequestBody Tarjeta tarjeta) {
        return service.crearTarjeta(tarjeta);
    }

    @GetMapping
    public List<Tarjeta> listar(@RequestParam EstadoTarjeta estado) {
        return service.listarPorEstado(estado);
    }

    @PutMapping("/{id}/programar")
    public Tarjeta programar(@PathVariable Long id, @RequestParam String fecha) {
        LocalDateTime fechaProgramada;
        if (fecha.length() == 10) {
            fechaProgramada = LocalDateTime.parse(fecha + "T08:00");
        } else {
            fechaProgramada = LocalDateTime.parse(fecha.replace(" ", "T"));
        }
        return service.programarMantenimiento(id, fechaProgramada);
    }

    @PutMapping("/{id}/reprogramar")
    public Tarjeta reprogramar(@PathVariable Long id, @RequestParam String fecha) {
        LocalDateTime fechaProgramada;
        if (fecha.length() == 10) {
            fechaProgramada = LocalDateTime.parse(fecha + "T08:00");
        } else {
            fechaProgramada = LocalDateTime.parse(fecha.replace(" ", "T"));
        }
        return service.reprogramarFecha(id, fechaProgramada);
    }

    @PutMapping("/{id}/cerrar")
    public Tarjeta cerrar(@PathVariable Long id,
                          @RequestParam String motivo,
                          @RequestParam(required = false) String mecanico) {
        return service.cerrarTarjeta(id, motivo, mecanico);
    }
}