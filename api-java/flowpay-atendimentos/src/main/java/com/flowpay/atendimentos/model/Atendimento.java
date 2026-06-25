package com.flowpay.atendimentos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Atendimento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String assunto;
    
    @Enumerated(EnumType.STRING)
    private TimeAtendimento timeDesignado;
    
    private String status; // AGUARDANDO, EM_ATENDIMENTO, FINALIZADO
    
    @ManyToOne
    private Atendente atendente; // Pode ser null se estiver na fila
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAssunto() { return assunto; }
    public void setAssunto(String assunto) { this.assunto = assunto; }
    public TimeAtendimento getTimeDesignado() { return timeDesignado; }
    public void setTimeDesignado(TimeAtendimento timeDesignado) { this.timeDesignado = timeDesignado; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Atendente getAtendente() { return atendente; }
    public void setAtendente(Atendente atendente) { this.atendente = atendente; }
}