# 📊 Documentação de Negócio: Dashboard FlowPay

O Dashboard da Central FlowPay foi projetado para ser o centro de controle operacional do sistema de atendimento. Ele consome a API REST protegida e atualiza as métricas em tempo real, garantindo uma visão clara sobre a distribuição de tickets, a capacidade da equipe e os SLAs (Service Level Agreements) de tempo.

Abaixo está o detalhamento de cada módulo da interface e suas respectivas regras de negócio.

## 1. Visão Geral e Ações (Cabeçalho)

O painel superior concentra os controles globais de acessibilidade (Modo Claro/Escuro) e as ações principais de simulação e gestão.

- Simular Cliente: Abre um modal para injetar um novo ticket no sistema. O usuário define o assunto e o time de destino (CARTOES, EMPRESTIMOS ou OUTROS). O backend processa a entrada e tenta alocar o cliente imediatamente ou o envia para a fila.

📋 Gerenciar Atendimentos: Lista os tickets que estão em andamento, permitindo que o gestor force o encerramento de um chamado, o que automaticamente libera capacidade no atendente e aciona a fila de espera.

- Novo Atendente: Permite o cadastro de novos profissionais, vinculando-os a um time específico. Ao criar um atendente, o sistema varre a fila do respectivo time e puxa até 3 clientes que estavam aguardando.

👥 Gerenciar Atendentes: Permite a exclusão de profissionais do banco de dados.

## 2. Indicadores de Volume (Cards Superiores)

Estes componentes apresentam o consolidado geral da operação no exato momento da requisição:

Total de Atendentes: Contagem absoluta de profissionais cadastrados e aptos a operar na plataforma.

Atendimentos no Banco: Mostra o volume total de tickets (somando os que estão em andamento e os que estão na fila). Exclui os finalizados para focar no fluxo ativo.

Pessoas na Fila (Total): Soma de todos os tickets que estão com status AGUARDANDO em qualquer um dos times, aguardando capacidade operacional.

## 3. Gestão de Filas por Time (Cards Centrais)

A regra de negócio central do sistema exige que o roteamento seja particionado por especialidade.

A tela exibe três contadores independentes (Cartões, Empréstimos e Outros Assuntos).

Um número maior que 0 (destacado em vermelho) indica que a demanda para aquele assunto superou a capacidade atual dos atendentes (limite de 3 simultâneos por pessoa) ou que não há profissionais logados naquele time específico.

## 4. Status Operacional (Tabela de Atendentes)

Uma visão granular de quem está operando e qual a sua carga de trabalho em tempo real.

Ocupação (Máx 3): O sistema garante uma distribuição justa (Round-Robin baseado em ociosidade). O painel exibe visualmente quantos tickets o profissional está tratando no momento.

Alerta de Lotação: Quando um atendente atinge a marca de 3 / 3, a interface destaca a linha em vermelho e exibe a tag Lotado, indicando que o algoritmo do backend irá ignorá-lo nas próximas distribuições até que um de seus chamados seja encerrado.

## 5. Histórico e Auditoria de SLA (Tabela Inferior)

Registra o ciclo de vida completo dos tickets que já foram processados, vital para análise de métricas e tempo de resposta.

Tempo na Fila: Calcula a diferença exata entre a entrada do ticket no banco (criadoEm) e o momento em que ele foi assumido por um atendente (iniciadoEm).

Duração do Atendimento: Mede o tempo líquido que o profissional levou para resolver o problema, subtraindo o iniciadoEm do finalizadoEm.

Esses dados atestam o funcionamento do sistema de timestamps na camada de serviço do backend.

## 🛡️ Considerações Técnicas de Front-end

Polling Automático: A tela consome o endpoint /api/dashboard em intervalos regulares (usando setInterval), garantindo que a tela reflita mudanças no banco sem necessidade de refresh manual.

Autenticação Invisível: Todas as requisições geradas pelas ações do Dashboard passam por um interceptor do Axios que anexa um Bearer Token, garantindo que a comunicação com o Spring Boot esteja blindada.

Tailwind Dark Mode: A implementação de acessibilidade foi feita via injeção de classes no DOM, armazenando a preferência do usuário no localStorage do navegador.
