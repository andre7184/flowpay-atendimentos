package com.flowpay.atendimentos.controller;

import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.repository.AtendimentoRepository;
import com.flowpay.atendimentos.service.AtendimentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private AtendenteRepository atendenteRepository;
    
    @Autowired
    private AtendimentoRepository atendimentoRepository;

    @Autowired
    private AtendimentoService atendimentoService;

    @GetMapping
    public Map<String, Object> getResumo() {
        Map<String, Object> resumo = new HashMap<>();
        
        resumo.put("totalAtendentes", atendenteRepository.count());
        resumo.put("totalAtendimentos", atendimentoRepository.count());
        
        Map<String, Integer> filas = new HashMap<>();
        filas.put("CARTOES", atendimentoService.getTamanhoFilaCartoes());
        filas.put("EMPRESTIMOS", atendimentoService.getTamanhoFilaEmprestimos());
        filas.put("OUTROS", atendimentoService.getTamanhoFilaOutros());
        resumo.put("filas", filas);

        // Retorna também os atendentes e seus status atuais
        resumo.put("atendentes", atendenteRepository.findAll());

        return resumo;
    }
}