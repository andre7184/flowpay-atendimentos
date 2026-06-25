package com.flowpay.atendimentos.controller;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atendentes")
@CrossOrigin(origins = "*") // Evita erro de CORS quando o Frontend chamar a API
public class AtendenteController {
    
    @Autowired
    private AtendenteRepository repository;

    @PostMapping
    public Atendente criar(@RequestBody Atendente atendente) {
        return repository.save(atendente);
    }

    @GetMapping
    public List<Atendente> listar() {
        return repository.findAll();
    }
}