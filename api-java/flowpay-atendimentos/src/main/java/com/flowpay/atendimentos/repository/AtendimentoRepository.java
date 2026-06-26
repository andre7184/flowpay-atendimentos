package com.flowpay.atendimentos.repository;

import com.flowpay.atendimentos.model.Atendimento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {
    // NOVO: Busca tickets de um atendente específico que estejam com um status específico
    List<Atendimento> findByAtendenteIdAndStatus(Long atendenteId, String status);
}