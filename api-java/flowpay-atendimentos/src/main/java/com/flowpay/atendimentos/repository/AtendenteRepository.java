package com.flowpay.atendimentos.repository;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.model.TimeAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtendenteRepository extends JpaRepository<Atendente, Long> {
    
    // NOVO: Retorna a lista apenas de quem está ativo
    List<Atendente> findByAtivoTrue();

    // ATUALIZADO: Agora o algoritmo de fila só procura quem está com Ativo = True
    Optional<Atendente> findFirstByTimeAtendimentoAndAtivoTrueAndAtendimentosAtivosLessThanOrderByAtendimentosAtivosAsc(
            TimeAtendimento timeAtendimento, Integer maxAtendimentos);
}