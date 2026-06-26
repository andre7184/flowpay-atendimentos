import { useState, useEffect } from "react";
import { flowpayService } from "../services/flowpayService";
import type { ResumoDashboard, Atendimento } from "../types";
import { InfoCard } from "../components/InfoCard";

export default function Dashboard() {
  const [resumo, setResumo] = useState<ResumoDashboard>({
    totalAtendentes: 0,
    totalAtendimentos: 0,
    filas: { CARTOES: 0, EMPRESTIMOS: 0, OUTROS: 0 },
    atendentes: [],
    historico: [],
  });

  const [listaAtendimentos, setListaAtendimentos] = useState<Atendimento[]>([]);
  const [modalAtendente, setModalAtendente] = useState(false);
  const [modalAtendimento, setModalAtendimento] = useState(false);
  const [modalGerenciarAtendentes, setModalGerenciarAtendentes] =
    useState(false);
  const [modalGerenciarAtendimentos, setModalGerenciarAtendimentos] =
    useState(false);

  const [formAtendente, setFormAtendente] = useState({
    nome: "",
    timeAtendimento: "CARTOES",
  });
  const [formAtendimento, setFormAtendimento] = useState({
    assunto: "",
    time: "CARTOES",
  });
  const [alerta, setAlerta] = useState({
    visivel: false,
    mensagem: "",
    tipo: "sucesso",
  });

  // === NOVO: ESTADO DO MODO ESCURO ===
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // === NOVO: EFEITO PARA ALTERAR A CLASSE NO HTML ===
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const mostrarAlerta = (mensagem: string, tipo: "sucesso" | "erro") => {
    setAlerta({ visivel: true, mensagem, tipo });
    setTimeout(
      () => setAlerta({ visivel: false, mensagem: "", tipo: "sucesso" }),
      3000,
    );
  };

  const carregarDados = async () => {
    try {
      const { data } = await flowpayService.getResumo();
      setResumo(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const { data } = await flowpayService.getResumo();
        if (isMounted) setResumo(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDashboard();
    const intervalo = setInterval(fetchDashboard, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalo);
    };
  }, []);

  const calcularDiferencaTempo = (inicio?: string, fim?: string) => {
    if (!inicio || !fim) return "-";
    const diff = Math.floor(
      (new Date(fim).getTime() - new Date(inicio).getTime()) / 1000,
    );
    return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  };

  const handleAction = async (
    actionFn: Promise<unknown>,
    successMsg: string,
    postAction?: () => void,
  ) => {
    try {
      await actionFn;
      carregarDados();
      if (postAction) postAction();
      mostrarAlerta(successMsg, "sucesso");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Ocorreu um erro na operação.", "erro");
    }
  };

  const handleCriarAtendente = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(
      flowpayService.criarAtendente(formAtendente),
      "Atendente cadastrado!",
      () => {
        setModalAtendente(false);
        setFormAtendente({ nome: "", timeAtendimento: "CARTOES" });
      },
    );
  };

  const handleCriarAtendimento = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(
      flowpayService.criarAtendimento(formAtendimento),
      "Cliente na fila!",
      () => setModalAtendimento(false),
    );
  };

  const handleExcluirAtendente = (id: number) => {
    handleAction(flowpayService.excluirAtendente(id), "Atendente excluído!");
  };

  const handleEncerrarAtendimento = (id: number) => {
    handleAction(
      flowpayService.encerrarAtendimento(id),
      "Atendimento encerrado!",
      abrirModalAtendimentos,
    );
  };

  const abrirModalAtendimentos = async () => {
    try {
      const { data } = await flowpayService.getAtendimentos();
      setListaAtendimentos(data);
      setModalGerenciarAtendimentos(true);
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro ao buscar atendimentos.", "erro");
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      <header className="mb-8 flex flex-col gap-6">
        {/* --- LINHA SUPERIOR: Título e Modo Escuro --- */}
        <div className="flex justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              FlowPay - Central
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Monitoramento de Filas e Distribuição
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-30 h-10 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={
              darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"
            }
          >
            Alterar Cor {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* --- LINHA INFERIOR: Botões de Ação --- */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalAtendimento(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
          >
            + Simular Cliente
          </button>
          <button
            onClick={abrirModalAtendimentos}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
          >
            📋 Gerenciar Atendimentos
          </button>
          <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-slate-700 mx-2"></div>{" "}
          {/* Separador visual opcional */}
          <button
            onClick={() => setModalAtendente(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
          >
            + Novo Atendente
          </button>
          <button
            onClick={() => setModalGerenciarAtendentes(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
          >
            👥 Gerenciar Atendentes
          </button>
        </div>
      </header>

      {/* --- Utilizando os Componentes Reutilizáveis --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          titulo="Total de Atendentes"
          valor={resumo.totalAtendentes}
          corBorda="border-l-blue-500"
        />
        <InfoCard
          titulo="Atendimentos no Banco"
          valor={resumo.totalAtendimentos}
          corBorda="border-l-green-500"
        />
        <InfoCard
          titulo="Pessoas na Fila (Total)"
          valor={
            resumo.filas.CARTOES +
            resumo.filas.EMPRESTIMOS +
            resumo.filas.OUTROS
          }
          corBorda="border-l-orange-500"
        />
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Filas de Espera por Time
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          titulo="💳 Cartões"
          subtitulo="Aguardando atendente"
          valor={resumo.filas.CARTOES}
          corBorda="border-l-red-100 dark:border-l-red-900/50"
          corValor="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg text-3xl"
        />
        <InfoCard
          titulo="💰 Empréstimos"
          subtitulo="Aguardando atendente"
          valor={resumo.filas.EMPRESTIMOS}
          corBorda="border-l-red-100 dark:border-l-red-900/50"
          corValor="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg text-3xl"
        />
        <InfoCard
          titulo="📌 Outros Assuntos"
          subtitulo="Aguardando atendente"
          valor={resumo.filas.OUTROS}
          corBorda="border-l-red-100 dark:border-l-red-900/50"
          corValor="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg text-3xl"
        />
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Status dos Atendentes
      </h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-8 transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Ocupação (Máx 3)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {resumo.atendentes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400"
                >
                  Nenhum atendente cadastrado.
                </td>
              </tr>
            ) : (
              resumo.atendentes.map((atendente) => (
                <tr
                  key={atendente.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    #{atendente.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {atendente.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                    {atendente.timeAtendimento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-bold ${atendente.atendimentosAtivos === 3 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {atendente.atendimentosAtivos} / 3
                    </span>
                    {atendente.atendimentosAtivos === 3 && (
                      <span className="ml-2 px-2 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                        Lotado
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Atendimentos Finalizados (Histórico)
      </h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-8 transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Assunto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Atendente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Tempo na Fila
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                Duração Atendimento
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {!resumo.historico ||
            resumo.historico.filter((a) => a.status === "FINALIZADO").length ===
              0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400"
                >
                  Nenhum atendimento finalizado ainda.
                </td>
              </tr>
            ) : (
              resumo.historico
                .filter((a) => a.status === "FINALIZADO")
                .map((atendimento) => (
                  <tr
                    key={atendimento.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      #{atendimento.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {atendimento.assunto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {atendimento.atendente?.nome || "Sistema"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 dark:text-orange-400 font-medium">
                      {calcularDiferencaTempo(
                        atendimento.criadoEm,
                        atendimento.iniciadoEm,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {calcularDiferencaTempo(
                        atendimento.iniciadoEm,
                        atendimento.finalizadoEm,
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modais com suporte ao Dark Mode --- */}
      {modalAtendente && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-96 border dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Cadastrar Atendente
            </h3>
            <form
              onSubmit={handleCriarAtendente}
              className="flex flex-col gap-4"
            >
              {/* Campo: Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Nome do Atendente
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Ana Silva"
                  value={formAtendente.nome}
                  onChange={(e) =>
                    setFormAtendente({ ...formAtendente, nome: e.target.value })
                  }
                />
              </div>

              {/* Campo: Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Time de Especialidade
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                  value={formAtendente.timeAtendimento}
                  onChange={(e) =>
                    setFormAtendente({
                      ...formAtendente,
                      timeAtendimento: e.target.value,
                    })
                  }
                >
                  <option value="CARTOES">Cartões</option>
                  <option value="EMPRESTIMOS">Empréstimos</option>
                  <option value="OUTROS">Outros Assuntos</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalAtendente(false)}
                  className="cursor-pointer px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAtendimento && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-96 border dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Simular Cliente
            </h3>
            <form
              onSubmit={handleCriarAtendimento}
              className="flex flex-col gap-4"
            >
              {/* Campo: Assunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Qual é o problema ou dúvida?
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-2 rounded outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Meu cartão não passa"
                  value={formAtendimento.assunto}
                  onChange={(e) =>
                    setFormAtendimento({
                      ...formAtendimento,
                      assunto: e.target.value,
                    })
                  }
                />
              </div>

              {/* Campo: Fila */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Direcionar para a fila de:
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-2 rounded outline-none focus:ring-2 focus:ring-green-500"
                  value={formAtendimento.time}
                  onChange={(e) =>
                    setFormAtendimento({
                      ...formAtendimento,
                      time: e.target.value,
                    })
                  }
                >
                  <option value="CARTOES">Cartões</option>
                  <option value="EMPRESTIMOS">Empréstimos</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalAtendimento(false)}
                  className="cursor-pointer px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Simular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalGerenciarAtendentes && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-150 max-h-[80vh] overflow-y-auto border dark:border-slate-700">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Excluir Atendentes
              </h3>
              <button
                onClick={() => setModalGerenciarAtendentes(false)}
                className="cursor-pointer text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white font-bold mouse-pointer"
              >
                X
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <tbody>
                {resumo.atendentes.map((at) => (
                  <tr
                    key={at.id}
                    className="border-t border-gray-200 dark:border-slate-700"
                  >
                    <td className="py-2 text-gray-500 dark:text-slate-400">
                      #{at.id}
                    </td>
                    <td className="py-2 text-gray-900 dark:text-white">
                      {at.nome}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleExcluirAtendente(at.id)}
                        className="cursor-pointer bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalGerenciarAtendimentos && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-200 max-h-[80vh] overflow-y-auto border dark:border-slate-700">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Encerrar Atendimentos
              </h3>
              <button
                onClick={() => setModalGerenciarAtendimentos(false)}
                className="cursor-pointer text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white font-bold"
              >
                X
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <tbody>
                {listaAtendimentos
                  .filter((a) => a.status !== "FINALIZADO")
                  .map((at) => (
                    <tr
                      key={at.id}
                      className="border-t border-gray-200 dark:border-slate-700"
                    >
                      <td className="py-2 text-gray-500 dark:text-slate-400">
                        #{at.id}
                      </td>
                      <td className="py-2 text-gray-900 dark:text-white">
                        {at.assunto}
                      </td>
                      <td className="py-2">
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 text-xs rounded font-bold">
                          {at.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {at.status === "EM_ATENDIMENTO" && (
                          <button
                            onClick={() => handleEncerrarAtendimento(at.id)}
                            className="bg-emerald-500 text-white px-2 py-1 rounded text-sm hover:bg-emerald-600 cursor-pointer"
                          >
                            Encerrar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alerta.visivel && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 z-50 transition-all ${alerta.tipo === "sucesso" ? "bg-green-500" : "bg-red-500"}`}
        >
          {alerta.mensagem}
        </div>
      )}
    </div>
  );
}
