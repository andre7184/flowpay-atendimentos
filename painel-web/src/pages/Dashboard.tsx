import { useState, useEffect } from "react";
import api from "../services/api.ts";

// Interfaces do TypeScript para mapear os dados do Java
interface Atendente {
  id: number;
  nome: string;
  timeAtendimento: string;
  atendimentosAtivos: number;
}

interface ResumoDashboard {
  totalAtendentes: number;
  totalAtendimentos: number;
  filas: { CARTOES: number; EMPRESTIMOS: number; OUTROS: number };
  atendentes: Atendente[];
}

export default function Dashboard() {
  const [resumo, setResumo] = useState<ResumoDashboard>({
    totalAtendentes: 0,
    totalAtendimentos: 0,
    filas: { CARTOES: 0, EMPRESTIMOS: 0, OUTROS: 0 },
    atendentes: [],
  });

  useEffect(() => {
    let isMounted = true; // Controle para evitar vazamento de memória

    const fetchDashboard = async () => {
      try {
        const response = await api.get<ResumoDashboard>("/dashboard");
        // Só atualiza o estado se o componente ainda estiver na tela
        if (isMounted) {
          setResumo(response.data);
        }
      } catch (error) {
        console.error("Erro de conexão com a API Java:", error);
      }
    };

    // Chamada inicial
    fetchDashboard();

    // Configura a atualização a cada 3 segundos
    const intervalo = setInterval(fetchDashboard, 3000);

    // Função de limpeza (cleanup)
    return () => {
      isMounted = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          FlowPay - Central de Atendimento
        </h1>
        <p className="text-gray-600">Monitoramento de Filas e Distribuição</p>
      </header>

      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-blue-500">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Total de Atendentes
          </h2>
          <p className="text-4xl font-bold text-gray-800 mt-2">
            {resumo.totalAtendentes}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-green-500">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Atendimentos no Banco
          </h2>
          <p className="text-4xl font-bold text-gray-800 mt-2">
            {resumo.totalAtendimentos}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-orange-500">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Pessoas na Fila (Total)
          </h2>
          <p className="text-4xl font-bold text-gray-800 mt-2">
            {resumo.filas.CARTOES +
              resumo.filas.EMPRESTIMOS +
              resumo.filas.OUTROS}
          </p>
        </div>
      </div>

      {/* Visão Detalhada das Filas */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Filas de Espera por Time
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">💳 Cartões</h3>
            <p className="text-sm text-gray-500 mt-1">Aguardando atendente</p>
          </div>
          <span className="text-3xl font-extrabold text-red-500 bg-red-50 px-4 py-2 rounded-lg">
            {resumo.filas.CARTOES}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">
              💰 Empréstimos
            </h3>
            <p className="text-sm text-gray-500 mt-1">Aguardando atendente</p>
          </div>
          <span className="text-3xl font-extrabold text-red-500 bg-red-50 px-4 py-2 rounded-lg">
            {resumo.filas.EMPRESTIMOS}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-700 text-lg">
              📌 Outros Assuntos
            </h3>
            <p className="text-sm text-gray-500 mt-1">Aguardando atendente</p>
          </div>
          <span className="text-3xl font-extrabold text-red-500 bg-red-50 px-4 py-2 rounded-lg">
            {resumo.filas.OUTROS}
          </span>
        </div>
      </div>

      {/* Tabela de Atendentes */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Status dos Atendentes
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ocupação (Máx 3)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resumo.atendentes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Nenhum atendente cadastrado no sistema.
                </td>
              </tr>
            ) : (
              resumo.atendentes.map((atendente) => (
                <tr key={atendente.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{atendente.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {atendente.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {atendente.timeAtendimento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-bold ${atendente.atendimentosAtivos === 3 ? "text-red-600" : "text-green-600"}`}
                      >
                        {atendente.atendimentosAtivos} / 3
                      </span>
                      {atendente.atendimentosAtivos === 3 && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Lotado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
