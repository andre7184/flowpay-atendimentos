package com.flowpay.atendimentos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Atendente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    
    @Enumerated(EnumType.STRING)
    private TimeAtendimento timeAtendimento;
    
    private Integer atendimentosAtivos = 0; // Máximo 3
    
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }

    public void setNome(String nome) { this.nome = nome; }

    public TimeAtendimento getTimeAtendimento() { return timeAtendimento; }

    public void setTimeAtendimento(TimeAtendimento timeAtendimento) { this.timeAtendimento = timeAtendimento; }

    public Integer getAtendimentosAtivos() { return atendimentosAtivos; }

    public void setAtendimentosAtivos(Integer atendimentosAtivos) { this.atendimentosAtivos = atendimentosAtivos; }

}