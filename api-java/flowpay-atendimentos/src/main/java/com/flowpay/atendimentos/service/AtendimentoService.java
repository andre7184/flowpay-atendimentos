package com.flowpay.atendimentos.service;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.model.Atendimento;
import com.flowpay.atendimentos.model.TimeAtendimento;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.repository.AtendimentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

@Service
public class AtendimentoService {

    @Autowired
    private AtendimentoRepository atendimentoRepository;

    @Autowired
    private AtendenteRepository atendenteRepository;

    // Filas em memória para cada time
    private Queue<Atendimento> filaCartoes = new LinkedList<>();
    private Queue<Atendimento> filaEmprestimos = new LinkedList<>();
    private Queue<Atendimento> filaOutros = new LinkedList<>();

    public Atendimento registrarAtendimento(String assunto, TimeAtendimento time) {
        Atendimento novo = new Atendimento();
        novo.setCriadoEm(LocalDateTime.now());
        novo.setAssunto(assunto);
        novo.setTimeDesignado(time);
        novo.setStatus("AGUARDANDO");
        
        novo = atendimentoRepository.save(novo);
        tentarDistribuir(novo);
        
        return novo;
    }

    private void tentarDistribuir(Atendimento atendimento) {
        // Busca um atendente que seja do time, ESTEJA ATIVO e tenha menos de 3 chamados
        atendenteRepository.findFirstByTimeAtendimentoAndAtivoTrueAndAtendimentosAtivosLessThanOrderByAtendimentosAtivosAsc(
                atendimento.getTimeDesignado(), 3
        ).ifPresentOrElse(
                atendenteLivre -> {
                    atendimento.setAtendente(atendenteLivre);
                    atendimento.setStatus("EM_ATENDIMENTO");
                    atendimento.setIniciadoEm(LocalDateTime.now());
                    
                    atendenteLivre.setAtendimentosAtivos(atendenteLivre.getAtendimentosAtivos() + 1);
                    
                    atendenteRepository.save(atendenteLivre);
                    atendimentoRepository.save(atendimento);
                },
                () -> {
                    adicionarNaFila(atendimento);
                }
        );
    }

    private void adicionarNaFila(Atendimento atendimento) {
        switch (atendimento.getTimeDesignado()) {
            case CARTOES -> filaCartoes.add(atendimento);
            case EMPRESTIMOS -> filaEmprestimos.add(atendimento);
            case OUTROS -> filaOutros.add(atendimento);
        }
    }

    public void finalizarAtendimento(Long atendimentoId) {
        atendimentoRepository.findById(atendimentoId).ifPresent(atendimento -> {
            if ("EM_ATENDIMENTO".equals(atendimento.getStatus()) && atendimento.getAtendente() != null) {
                
                atendimento.setStatus("FINALIZADO");
                atendimento.setFinalizadoEm(LocalDateTime.now());
                
                Atendente atendente = atendimento.getAtendente();
                atendente.setAtendimentosAtivos(atendente.getAtendimentosAtivos() - 1);
                
                atendimentoRepository.save(atendimento);
                atendenteRepository.save(atendente);
                
                puxarProximoDaFila(atendente.getTimeAtendimento());
            }
        });
    }

    private void puxarProximoDaFila(TimeAtendimento time) {
        Atendimento proximo = null;
        switch (time) {
            case CARTOES -> proximo = filaCartoes.poll();
            case EMPRESTIMOS -> proximo = filaEmprestimos.poll();
            case OUTROS -> proximo = filaOutros.poll();
        }
        
        if (proximo != null) {
            tentarDistribuir(proximo);
        }
    }

    public int getTamanhoFilaCartoes() { return filaCartoes.size(); }
    public int getTamanhoFilaEmprestimos() { return filaEmprestimos.size(); }
    public int getTamanhoFilaOutros() { return filaOutros.size(); }

    // Chamado quando um atendente é recém-criado OU quando é reativado (toggle)
    public void processarFilaParaAtendenteDisponivel(TimeAtendimento time) {
        for (int i = 0; i < 3; i++) {
            puxarProximoDaFila(time);
        }
    }

    // NOVO: Encerra os tickets forçadamente quando o atendente é desativado
    public void encerrarAtendimentosDeAtendenteDesativado(Atendente atendente) {
        List<Atendimento> ativos = atendimentoRepository.findByAtendenteIdAndStatus(atendente.getId(), "EM_ATENDIMENTO");
        
        for (Atendimento atendimento : ativos) {
            atendimento.setStatus("FINALIZADO");
            atendimento.setFinalizadoEm(LocalDateTime.now());
            atendimentoRepository.save(atendimento);
        }
        
        // Zera os atendimentos ativos daquele profissional, já que todos foram fechados
        atendente.setAtendimentosAtivos(0);
        atendenteRepository.save(atendente);
    }
}