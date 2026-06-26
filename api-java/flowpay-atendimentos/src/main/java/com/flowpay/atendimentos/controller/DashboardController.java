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

@RestController // Anota essa classe como um Controller
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired // Injeta o repository aqui
    private AtendenteRepository atendenteRepository;
    
    @Autowired // Injeta o repository aqui
    private AtendimentoRepository atendimentoRepository;

    @Autowired // Injeta o service aqui
    private AtendimentoService atendimentoService;

    @GetMapping // Anota essa rota como GET
    public Map<String, Object> getResumo() {
        Map<String, Object> resumo = new HashMap<>();
        
        // Retorna o total de atendentes e atendimentos
        resumo.put("totalAtendentes", atendenteRepository.count());
        resumo.put("totalAtendimentos", atendimentoRepository.count());
        
        Map<String, Integer> filas = new HashMap<>();

        // Retorna o tamanho das filas
        filas.put("CARTOES", atendimentoService.getTamanhoFilaCartoes());
        filas.put("EMPRESTIMOS", atendimentoService.getTamanhoFilaEmprestimos());
        filas.put("OUTROS", atendimentoService.getTamanhoFilaOutros());
        resumo.put("filas", filas);

        // Retorna também os atendentes e seus status atuais
        resumo.put("atendentes", atendenteRepository.findAll());

        // Retorna o histórico de atendimentos:
        resumo.put("historico", atendimentoRepository.findAll());

        return resumo;
    }
}