package com.flowpay.atendimentos.controller;

import com.flowpay.atendimentos.model.Atendimento;
import com.flowpay.atendimentos.model.TimeAtendimento;
import com.flowpay.atendimentos.service.AtendimentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/atendimentos")
@CrossOrigin(origins = "*")
public class AtendimentoController {

    @Autowired
    private AtendimentoService service;

    // Record utilizado para mapear o JSON de entrada de forma limpa (disponível no Java 14+)
    public record NovoAtendimentoDTO(String assunto, TimeAtendimento time) {}

    @PostMapping
    public ResponseEntity<Atendimento> registrar(@RequestBody NovoAtendimentoDTO dto) {
        Atendimento atendimento = service.registrarAtendimento(dto.assunto(), dto.time());
        return ResponseEntity.ok(atendimento);
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizar(@PathVariable Long id) {
        service.finalizarAtendimento(id);
        return ResponseEntity.ok().build();
    }

    // Adicione esta injeção de dependência no topo da classe:
    @Autowired
    private com.flowpay.atendimentos.repository.AtendimentoRepository repository;

    // Adicione este método para listar os tickets no Dashboard
    @GetMapping
    public java.util.List<com.flowpay.atendimentos.model.Atendimento> listar() {
        return repository.findAll();
    }
}
