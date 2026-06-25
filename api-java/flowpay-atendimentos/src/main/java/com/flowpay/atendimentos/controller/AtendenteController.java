package com.flowpay.atendimentos.controller;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.service.AtendimentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atendentes")
@CrossOrigin(origins = "*") // Evita erro de CORS quando o Frontend chamar a API
public class AtendenteController {
    
    @Autowired
    private AtendenteRepository repository;

    @Autowired
    private AtendimentoService atendimentoService; // Injetamos o service aqui

    @PostMapping
    public Atendente criar(@RequestBody Atendente atendente) {
        Atendente novoAtendente = repository.save(atendente);

        // Avisa o sistema para olhar se tem alguém esperando no time desse novo atendente!
        atendimentoService.processarFilaParaNovoAtendente(novoAtendente.getTimeAtendimento());
        
        return novoAtendente;
    }

    @GetMapping
    public List<Atendente> listar() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

}