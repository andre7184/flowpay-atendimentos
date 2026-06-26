# 🚀 FlowPay - Central de Atendimento (Desafio Técnico)

Este projeto é uma solução fullstack desenvolvida para o desafio técnico da FlowPay. O objetivo é gerenciar o fluxo de atendimento a clientes, distribuindo chamados de forma inteligente entre os atendentes, respeitando a capacidade máxima de cada profissional e gerenciando filas de espera.

## 🧠 Arquitetura e Decisões de Negócio

A aplicação adota um padrão arquitetural robusto com separação clara de responsabilidades:

- **Distribuição Inteligente:** O sistema garante que nenhum atendente receba mais do que **3 tickets simultâneos**.
- **Gestão de Filas em Memória:** Quando o time está lotado, os tickets aguardam em filas particionadas por assunto (`CARTOES`, `EMPRESTIMOS`, `OUTROS`). Assim que um atendente finaliza um chamado, o sistema automaticamente "puxa" o próximo cliente da fila.
- **Métricas de SLA:** O backend registra os _timestamps_ exatos de criação, início e término do atendimento, permitindo auditoria de tempo em fila e tempo de operação.
- **Segurança (API Key):** As rotas de API REST são protegidas por um Interceptor/Filter, exigindo um `Bearer Token` para prevenir acessos não autorizados.

## 🛠️ Tecnologias Utilizadas

**Backend:**

- Java 17 + Spring Boot 3
- Spring Data JPA + H2 Database (Banco em memória)
- JUnit 5 + Mockito (Testes Unitários)

**Frontend:**

- React 18 + Vite
- TypeScript
- Tailwind CSS v4 + Axios

**Infraestrutura:**

- Docker & Docker Compose (Multi-stage builds para otimização de imagens)

---

## ⚙️ Como Executar o Projeto (Via Docker)

A maneira mais fácil e recomendada de rodar a aplicação é utilizando o Docker Compose, que subirá o Banco de Dados, a API e o Painel Web em uma rede isolada.

1. Certifique-se de ter o [Docker](https://www.docker.com/) instalado na sua máquina.
2. Clone o repositório e acesse a pasta raiz.
3. Execute o comando:
   ```bash
   docker-compose up --build -d
   ```
4. Acesse o painel pelo navegador: http://localhost
   (O Nginx na imagem do frontend redirecionará a porta 80 automaticamente).

## 🖥️ Como Executar Manualmente (Modo Desenvolvimento)

Caso queira rodar os serviços fora do Docker:

1. Backend (Spring Boot):

   ```bash
    cd api-java
    mvn clean install
    mvn spring-boot:run
   ```

   A API estará disponível em http://localhost:8080.

2. Frontend (React):
   ```bash
    cd painel-web
    npm install
    npm run dev
   ```
   O Painel Web estará disponível em http://localhost:5173.

## 🔒 Autenticação e Uso da API

Para interagir com a API utilizando ferramentas como Postman ou Insomnia, é necessário enviar o token de autorização no cabeçalho (Header) da requisição:
TOKEN PARA TESTES: token-flowpay-teste

- Key: Authorization
- Value: Bearer token-flowpay-teste

## 🔌 Referência da API REST

A API foi projetada para garantir a integridade referencial do banco de dados e a manutenção do histórico de métricas (SLA). Por isso, a exclusão de registros essenciais utiliza o padrão de **Soft Delete** (Inativação Lógica).

### 📊 Painel de Controle (`/api/dashboard`)

- **`GET /`**
  - **Descrição:** Rota centralizada que retorna o consolidado em tempo real de toda a operação, formatado especificamente para renderização rápida no Front-end (BFF - Backend For Frontend).
  - **Dados Retornados:**
    - **Métricas Gerais:** Quantidade total de profissionais aptos (ativos) e o volume bruto de atendimentos registrados.
    - **Monitoramento de Filas:** Contadores independentes mapeando o tamanho da fila de espera para cada time (`CARTOES`, `EMPRESTIMOS`, `OUTROS`).
    - **Status Operacional:** Lista completa de todos os atendentes (incluindo inativos) informando sua capacidade de carga atual (`atendimentosAtivos / 3`).
    - **Histórico (SLA):** Tabela completa de tickets para cálculo de tempo médio na fila e tempo líquido de atendimento.

### 👥 Gestão de Atendentes (`/api/atendentes`)

- **`POST /`**
  - **Descrição:** Cadastra um novo profissional. O sistema automaticamente o define como ativo (`ativo: true`).
  - **Gatilho Automático:** Assim que criado, o serviço verifica se há clientes na fila do seu respectivo time e já atribui até 3 chamados para ele.

- **`GET /`**
  - **Descrição:** Retorna a lista completa de atendentes, incluindo ativos e inativos, para a interface de administração. _(Nota: O resumo geral do painel filtra apenas os ativos)._

- **`DELETE /{id}`**
  - **Descrição:** Executa a inativação lógica do profissional (Soft Delete), preservando os registros de histórico e estatísticas.
  - **Gatilho de Cascata:** Ao inativar, o sistema busca todos os tickets que estavam `EM_ATENDIMENTO` com este profissional e os finaliza automaticamente, evitando que os chamados fiquem retidos ("órfãos") no banco de dados.

- **`PATCH /{id}/status`**
  - **Descrição:** Alterna (_toggle_) o status do profissional entre Ativo e Inativo.
  - **Gatilho Automático:** \* Se alterado para **Inativo**: Aciona a mesma regra de cascata do `DELETE` para encerrar atendimentos em andamento.
    - Se alterado para **Ativo**: Aciona o serviço de filas para resgatar até 3 tickets que estejam aguardando atendimento no time do profissional.

---

### 🎟️ Gestão de Atendimentos (`/api/atendimentos`)

- **`POST /`**
  - **Descrição:** Cria um novo ticket (simulação de cliente) no status `AGUARDANDO`.
  - **Gatilho Automático:** O algoritmo de distribuição (_Round-Robin_ baseado em ociosidade) tenta alocar o ticket para o atendente ativo do time solicitado que tiver a menor carga de trabalho. Se todos estiverem lotados, o ticket permanece na fila.

- **`POST /{id}/finalizar`**
  - **Descrição:** Encerra um ticket em andamento, carimbando a data/hora final para cálculo de SLA de duração.
  - **Gatilho Automático:** Libera espaço na "mesa" do atendente (reduz a ocupação) e automaticamente puxa o próximo ticket aguardando na fila daquele mesmo time.

## 🧪 Testes Unitários automatizados

O core de distribuição e gerenciamento de filas no AtendimentoService está coberto por testes unitários com Mockito. Para executá-los:

```bash
cd api-java/flowpay-atendimentos
mvn test
```

## Documentação do Painel Web

Veja mais detalhes em [painel-web/README.md](painel-web/README.md)
