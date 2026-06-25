package com.flowpay.atendimentos.repository;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.model.TimeAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtendenteRepository extends JpaRepository<Atendente, Long> {
    
    // Busca atendentes de um time específico que tenham menos de 3 atendimentos ativos
    Optional<Atendente> findFirstByTimeAtendimentoAndAtendimentosAtivosLessThanOrderByAtendimentosAtivosAsc(
            TimeAtendimento timeAtendimento, Integer maxAtendimentos);
}