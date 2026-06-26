package com.flowpay.atendimentos.controller;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.service.AtendimentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Anota essa classe como um Controller
@RequestMapping("/api/atendentes") 
@CrossOrigin(origins = "*") // Evita erro de CORS quando o Frontend chamar a API
public class AtendenteController {
    
    @Autowired // Injeta o repository aqui
    private AtendenteRepository repository;

    @Autowired // Injeta o service aqui
    private AtendimentoService atendimentoService; // Injetamos o service aqui

    @PostMapping // Anota essa rota como POST
    public Atendente criar(@RequestBody Atendente atendente) {
        Atendente novoAtendente = repository.save(atendente);

        // Avisa o sistema para olhar se tem alguém esperando no time desse novo atendente!
        atendimentoService.processarFilaParaNovoAtendente(novoAtendente.getTimeAtendimento());
        
        return novoAtendente;
    }

    @GetMapping // Anota essa rota como GET
    public List<Atendente> listar() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}") // Anota essa rota como DELETE
    public org.springframework.http.ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

}