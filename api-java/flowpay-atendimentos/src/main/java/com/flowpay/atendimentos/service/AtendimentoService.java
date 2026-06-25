package com.flowpay.atendimentos.service;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.model.Atendimento;
import com.flowpay.atendimentos.model.TimeAtendimento;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.repository.AtendimentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
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
        novo.setAssunto(assunto);
        novo.setTimeDesignado(time);
        novo.setStatus("AGUARDANDO");
        
        // Salva o estado inicial no banco
        novo = atendimentoRepository.save(novo);

        // Tenta distribuir imediatamente
        tentarDistribuir(novo);
        
        return novo;
    }

    private void tentarDistribuir(Atendimento atendimento) {
        // Usa o método customizado do repository que criamos na Task 2
        atendenteRepository.findFirstByTimeAtendimentoAndAtendimentosAtivosLessThanOrderByAtendimentosAtivosAsc(
                atendimento.getTimeDesignado(), 3
        ).ifPresentOrElse(
                atendenteLivre -> {
                    // Achou atendente!
                    atendimento.setAtendente(atendenteLivre);
                    atendimento.setStatus("EM_ATENDIMENTO");
                    
                    atendenteLivre.setAtendimentosAtivos(atendenteLivre.getAtendimentosAtivos() + 1);
                    
                    atendenteRepository.save(atendenteLivre);
                    atendimentoRepository.save(atendimento);
                },
                () -> {
                    // Não achou atendente. Coloca na fila correta.
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

    // O método abaixo será chamado pela rota de finalizar
    public void finalizarAtendimento(Long atendimentoId) {
        atendimentoRepository.findById(atendimentoId).ifPresent(atendimento -> {
            if ("EM_ATENDIMENTO".equals(atendimento.getStatus()) && atendimento.getAtendente() != null) {
                
                // Finaliza o atendimento atual
                atendimento.setStatus("FINALIZADO");
                Atendente atendente = atendimento.getAtendente();
                atendente.setAtendimentosAtivos(atendente.getAtendimentosAtivos() - 1);
                
                atendimentoRepository.save(atendimento);
                atendenteRepository.save(atendente);
                
                // Como liberou espaço, chama o próximo da fila do mesmo time
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

    // Métodos para o Dashboard consultar o tamanho das filas
    public int getTamanhoFilaCartoes() { return filaCartoes.size(); }
    public int getTamanhoFilaEmprestimos() { return filaEmprestimos.size(); }
    public int getTamanhoFilaOutros() { return filaOutros.size(); }
}