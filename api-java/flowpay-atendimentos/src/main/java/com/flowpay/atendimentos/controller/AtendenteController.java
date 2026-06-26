package com.flowpay.atendimentos.controller;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.service.AtendimentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atendentes")
@CrossOrigin(origins = "*")
public class AtendenteController {
    
    @Autowired
    private AtendenteRepository repository;

    @Autowired
    private AtendimentoService atendimentoService;

    @PostMapping
    public Atendente criar(@RequestBody Atendente atendente) {
        // Garante que todo novo atendente cadastrado já nasça ativo
        atendente.setAtivo(true);
        Atendente novoAtendente = repository.save(atendente);

        // Avisa o sistema para olhar se tem alguém esperando na fila desse novo atendente
        atendimentoService.processarFilaParaAtendenteDisponivel(novoAtendente.getTimeAtendimento());
        
        return novoAtendente;
    }

    @GetMapping
    public List<Atendente> listar() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.findById(id).ifPresent(atendente -> {
            atendente.setAtivo(false);
            
            // Limpa a mesa do atendente antes de excluí-lo (desativá-lo)
            atendimentoService.encerrarAtendimentosDeAtendenteDesativado(atendente);
            
            repository.save(atendente);
        });
        
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id) {
        repository.findById(id).ifPresent(atendente -> {
            boolean novoStatus = !atendente.getAtivo();
            atendente.setAtivo(novoStatus);

            if (novoStatus) {
                // Se foi ATIVADO: salva e tenta puxar clientes da fila para ele
                repository.save(atendente);
                atendimentoService.processarFilaParaAtendenteDisponivel(atendente.getTimeAtendimento());
            } else {
                // Se foi DESATIVADO: encerra os ativos em cascata e salva
                atendimentoService.encerrarAtendimentosDeAtendenteDesativado(atendente);
                repository.save(atendente);
            }
        });
        
        return ResponseEntity.noContent().build();
    }
}