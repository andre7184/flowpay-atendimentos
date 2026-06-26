package com.flowpay.atendimentos.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

// A anotação @Component avisa o Spring Boot para carregar esse filtro automaticamente
@Component
public class ApiTokenFilter implements Filter {

    // Este é o token fixo que definimos para o teste
    private static final String TOKEN_SECRETO = "Bearer token-flowpay-teste";

    @Override // Essa classe implementa a interface Filter
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // 1. Ignora regras de segurança para rotas fora da API (como o console do banco H2)
        if (!req.getRequestURI().startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Permite as requisições OPTIONS passarem (essencial para não quebrar o CORS no React)
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Captura o cabeçalho 'Authorization' que o React ou Postman enviaram
        String authHeader = req.getHeader("Authorization");
        
        // 4. Se não mandou o token ou mandou o token errado, bloqueia!
        if (authHeader == null || !authHeader.equals(TOKEN_SECRETO)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("{\"erro\": \"Acesso Negado: Token Inválido ou Ausente\"}");
            return;
        }

        // 5. Token validado com sucesso! Deixa seguir para o AtendimentoController ou DashboardController
        chain.doFilter(request, response);
    }
}