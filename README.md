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

## 🖥️ Como Executar Manualmente (Modo Desenvolvimento)

Para interagir com a API utilizando ferramentas como Postman ou Insomnia, é necessário enviar o token de autorização no cabeçalho (Header) da requisição:

- Key: Authorization
- Value: Bearer flowpay-teste-pleno-2026

Principais Endpoints:

- GET /api/dashboard - Retorna o consolidado de métricas, atendentes e filas.

- POST /api/atendentes - Cadastra um novo profissional.
  ```json
  {
    "nome": "Ana Maria",
    "timeAtendimento": "EMPRESTIMOS"
  }
  ```
- POST /api/atendimentos - Cadastra um novo atendimento.
  ```json
  {
    "assunto": "Nova Solicitacao",
    "time": "EMPRESTIMOS"
  }
  ```
- POST /api/atendimentos/{id}/finalizar - Encerra o chamado e aciona a fila.

- DELETE /api/atendentes/{id} - Remove um atendente(somente se nao houver atendimentos ativos).

## 🧪 Testes Unitários automatizados

O core de distribuição e gerenciamento de filas no AtendimentoService está coberto por testes unitários com Mockito. Para executá-los:

```bash
cd api-java
mvn test
```
