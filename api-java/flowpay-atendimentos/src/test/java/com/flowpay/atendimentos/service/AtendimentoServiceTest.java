package com.flowpay.atendimentos.service;

import com.flowpay.atendimentos.model.Atendente;
import com.flowpay.atendimentos.model.Atendimento;
import com.flowpay.atendimentos.model.TimeAtendimento;
import com.flowpay.atendimentos.repository.AtendenteRepository;
import com.flowpay.atendimentos.repository.AtendimentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AtendimentoServiceTest {

    // Mockamos os repositórios para não precisar de um banco de dados real rodando
    @Mock
    private AtendimentoRepository atendimentoRepository;

    @Mock
    private AtendenteRepository atendenteRepository;

    // Injetamos os mocks diretamente no serviço que vamos testar
    @InjectMocks
    private AtendimentoService atendimentoService;

    private Atendente atendenteMock;
    private Atendimento atendimentoMock;

    @BeforeEach
    void setUp() {
        // Preparamos dados fictícios antes de cada teste rodar
        atendenteMock = new Atendente();
        atendenteMock.setId(1L);
        atendenteMock.setNome("João");
        atendenteMock.setTimeAtendimento(TimeAtendimento.CARTOES);
        atendenteMock.setAtendimentosAtivos(0);

        atendimentoMock = new Atendimento();
        atendimentoMock.setId(1L);
        atendimentoMock.setAssunto("Dúvida");
        atendimentoMock.setTimeDesignado(TimeAtendimento.CARTOES);
        atendimentoMock.setStatus("EM_ATENDIMENTO");
        atendimentoMock.setAtendente(atendenteMock);
    }

    @Test
    void registrarAtendimento_ComAtendenteLivre_DeveAtribuirEAtualizarStatus() {
        // Arrange (Preparação)
        // Quando o service tentar salvar, retornamos o próprio objeto passado
        when(atendimentoRepository.save(any(Atendimento.class))).thenAnswer(i -> i.getArgument(0));
        // Simulamos que a query de busca por atendente livre encontrou o nosso João
        when(atendenteRepository.findFirstByTimeAtendimentoAndAtivoTrueAndAtendimentosAtivosLessThanOrderByAtendimentosAtivosAsc(
                TimeAtendimento.CARTOES, 3)).thenReturn(Optional.of(atendenteMock));

        // Act (Ação)
        Atendimento salvo = atendimentoService.registrarAtendimento("Problema no Cartão", TimeAtendimento.CARTOES);

        // Assert (Verificação)
        assertEquals("EM_ATENDIMENTO", salvo.getStatus());
        assertNotNull(salvo.getAtendente());
        assertEquals("João", salvo.getAtendente().getNome());
        assertEquals(1, atendenteMock.getAtendimentosAtivos()); // A ocupação do João deve ter subido
        verify(atendenteRepository, times(1)).save(atendenteMock); // Verifica se chamou o save() do atendente
    }

    @Test
    void registrarAtendimento_SemAtendenteLivre_DeveAdicionarNaFilaEmMemoria() {
        // Arrange
        when(atendimentoRepository.save(any(Atendimento.class))).thenAnswer(i -> i.getArgument(0));
        // Simulamos que a query retornou vazio (nenhum atendente com espaço ou disponível)
        when(atendenteRepository.findFirstByTimeAtendimentoAndAtivoTrueAndAtendimentosAtivosLessThanOrderByAtendimentosAtivosAsc(
                TimeAtendimento.CARTOES, 3)).thenReturn(Optional.empty());

        // Act
        Atendimento salvo = atendimentoService.registrarAtendimento("Problema no Cartão", TimeAtendimento.CARTOES);

        // Assert
        assertEquals("AGUARDANDO", salvo.getStatus());
        assertNull(salvo.getAtendente());
        assertEquals(1, atendimentoService.getTamanhoFilaCartoes()); // Garante que a fila subiu
        verify(atendenteRepository, never()).save(any()); // O atendente não deve ter sido salvo/alterado
    }

    @Test
    void finalizarAtendimento_DeveDiminuirOcupacao() {
        // Arrange
        atendenteMock.setAtendimentosAtivos(3); // Vamos fingir que ele estava lotado
        when(atendimentoRepository.findById(1L)).thenReturn(Optional.of(atendimentoMock));
        
        // Act
        atendimentoService.finalizarAtendimento(1L);

        // Assert
        assertEquals("FINALIZADO", atendimentoMock.getStatus());
        assertEquals(2, atendenteMock.getAtendimentosAtivos()); // A ocupação tem que cair para 2
        verify(atendimentoRepository, times(1)).save(atendimentoMock);
        verify(atendenteRepository, times(1)).save(atendenteMock);
    }
}