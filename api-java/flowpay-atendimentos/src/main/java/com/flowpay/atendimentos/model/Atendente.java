package com.flowpay.atendimentos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // Anota essa classe como uma entidade
public class Atendente {
    @Id // Anota esse campo como chave primária
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Anota esse campo como auto-increment
    
    private Boolean ativo = true;

    private String nome; // Anota esse campo como uma coluna
    
    @Enumerated(EnumType.STRING) // Anota esse campo como um enum
    private TimeAtendimento timeAtendimento;
    
    private Integer atendimentosAtivos = 0; // Máximo 3
    
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Boolean getAtivo() { return ativo; }
    
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getNome() { return nome; }

    public void setNome(String nome) { this.nome = nome; }

    // campo para o time de atendimento
    public TimeAtendimento getTimeAtendimento() { return timeAtendimento; }

    public void setTimeAtendimento(TimeAtendimento timeAtendimento) { this.timeAtendimento = timeAtendimento; }

    public Integer getAtendimentosAtivos() { return atendimentosAtivos; }

    // campo para o total de atendimentos ativos
    public void setAtendimentosAtivos(Integer atendimentosAtivos) { this.atendimentosAtivos = atendimentosAtivos; }

}