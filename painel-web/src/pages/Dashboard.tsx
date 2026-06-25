import { useState, useEffect } from "react";
import api from "../services/api.ts";

// --- Interfaces ---
interface Atendente {
  id: number;
  nome: string;
  timeAtendimento: string;
  atendimentosAtivos: number;
}

interface Atendimento {
  id: number;
  assunto: string;
  timeDesignado: string;
  status: string;
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

  const [listaAtendimentos, setListaAtendimentos] = useState<Atendimento[]>([]);

  // --- Modais ---
  const [modalAtendente, setModalAtendente] = useState(false);
  const [modalAtendimento, setModalAtendimento] = useState(false);
  const [modalGerenciarAtendentes, setModalGerenciarAtendentes] =
    useState(false);
  const [modalGerenciarAtendimentos, setModalGerenciarAtendimentos] =
    useState(false);

  // --- Formulários ---
  const [formAtendente, setFormAtendente] = useState({
    nome: "",
    timeAtendimento: "CARTOES",
  });
  const [formAtendimento, setFormAtendimento] = useState({
    assunto: "",
    time: "CARTOES",
  });

  // --- Toast Alert ---
  const [alerta, setAlerta] = useState({
    visivel: false,
    mensagem: "",
    tipo: "sucesso",
  });

  const mostrarAlerta = (mensagem: string, tipo: "sucesso" | "erro") => {
    setAlerta({ visivel: true, mensagem, tipo });
    setTimeout(() => {
      setAlerta({ visivel: false, mensagem: "", tipo: "sucesso" });
    }, 3000);
  };

  const carregarDados = async () => {
    try {
      const response = await api.get<ResumoDashboard>("/dashboard");
      setResumo(response.data);
    } catch (error) {
      console.error("Erro de conexão com a API Java:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const response = await api.get<ResumoDashboard>("/dashboard");
        if (isMounted) setResumo(response.data);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    fetchDashboard();
    const intervalo = setInterval(fetchDashboard, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalo);
    };
  }, []);

  // --- Criação (POST) ---
  const handleCriarAtendente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/atendentes", formAtendente);
      setModalAtendente(false);
      setFormAtendente({ nome: "", timeAtendimento: "CARTOES" });
      carregarDados();
      mostrarAlerta("Atendente cadastrado com sucesso!", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro ao cadastrar.", "erro");
    }
  };

  const handleCriarAtendimento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/atendimentos", formAtendimento);
      setModalAtendimento(false);
      setFormAtendimento({ assunto: "", time: "CARTOES" });
      carregarDados();
      mostrarAlerta("Cliente na fila!", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro ao registrar atendimento.", "erro");
    }
  };

  // --- Listagem e Ações Extras ---
  const abrirModalAtendimentos = async () => {
    try {
      const response = await api.get("/atendimentos");
      setListaAtendimentos(response.data);
      setModalGerenciarAtendimentos(true);
    } catch (error) {
      console.error(error);
      mostrarAlerta("Crie a rota GET /api/atendimentos no backend!", "erro");
    }
  };

  const handleExcluirAtendente = async (id: number) => {
    try {
      await api.delete(`/atendentes/${id}`);
      carregarDados();
      mostrarAlerta("Atendente excluído com sucesso!", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro. O atendente pode ter tickets vinculados.", "erro");
    }
  };

  const handleEncerrarAtendimento = async (id: number) => {
    try {
      await api.post(`/atendimentos/${id}/finalizar`);
      carregarDados(); // Atualiza dashboard
      abrirModalAtendimentos(); // Recarrega a lista da modal
      mostrarAlerta("Atendimento encerrado!", "sucesso");
    } catch (error) {
      console.error(error);
      mostrarAlerta("Erro ao encerrar atendimento.", "erro");
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            FlowPay - Central
          </h1>
          <p className="text-gray-600">Monitoramento de Filas e Distribuição</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModalAtendimento(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm"
          >
            + Simular Cliente
          </button>
          <button
            onClick={abrirModalAtendimentos}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm"
          >
            📋 Gerenciar Atendimentos
          </button>
          <button
            onClick={() => setModalAtendente(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm ml-4"
          >
            + Novo Atendente
          </button>
          <button
            onClick={() => setModalGerenciarAtendentes(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium shadow-sm"
          >
            👥 Gerenciar Atendentes
          </button>
        </div>
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

      {/* Tabela Resumo */}
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

      {/* --- MODAIS DE CADASTRO --- */}
      {modalAtendente && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Cadastrar Atendente
            </h3>
            <form
              onSubmit={handleCriarAtendente}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={formAtendente.nome}
                  onChange={(e) =>
                    setFormAtendente({ ...formAtendente, nome: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  className="w-full border p-2 rounded"
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
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalAtendente(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAtendimento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Simular Cliente
            </h3>
            <form
              onSubmit={handleCriarAtendimento}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={formAtendimento.assunto}
                  onChange={(e) =>
                    setFormAtendimento({
                      ...formAtendimento,
                      assunto: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={formAtendimento.time}
                  onChange={(e) =>
                    setFormAtendimento({
                      ...formAtendimento,
                      time: e.target.value,
                    })
                  }
                >
                  <option value="CARTOES">Problemas com cartão</option>
                  <option value="EMPRESTIMOS">Contratação de empréstimo</option>
                  <option value="OUTROS">Outros Assuntos</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalAtendimento(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Simular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAIS DE LISTAGEM --- */}
      {modalGerenciarAtendentes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-150 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Excluir Atendentes
              </h3>
              <button
                onClick={() => setModalGerenciarAtendentes(false)}
                className="text-gray-500 font-bold"
              >
                X
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left py-2 text-sm text-gray-500">ID</th>
                  <th className="text-left py-2 text-sm text-gray-500">Nome</th>
                  <th className="text-right py-2 text-sm text-gray-500">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumo.atendentes.map((at) => (
                  <tr key={at.id} className="border-t">
                    <td className="py-2">#{at.id}</td>
                    <td className="py-2">{at.nome}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleExcluirAtendente(at.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-200 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Encerrar Atendimentos
              </h3>
              <button
                onClick={() => setModalGerenciarAtendimentos(false)}
                className="text-gray-500 font-bold"
              >
                X
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left py-2 text-sm text-gray-500">ID</th>
                  <th className="text-left py-2 text-sm text-gray-500">
                    Assunto
                  </th>
                  <th className="text-left py-2 text-sm text-gray-500">
                    Status
                  </th>
                  <th className="text-right py-2 text-sm text-gray-500">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {listaAtendimentos
                  .filter((a) => a.status !== "FINALIZADO")
                  .map((at) => (
                    <tr key={at.id} className="border-t">
                      <td className="py-2">#{at.id}</td>
                      <td className="py-2">{at.assunto}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${at.status === "EM_ATENDIMENTO" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}
                        >
                          {at.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {at.status === "EM_ATENDIMENTO" && (
                          <button
                            onClick={() => handleEncerrarAtendimento(at.id)}
                            className="bg-emerald-500 text-white px-2 py-1 rounded text-sm hover:bg-emerald-600"
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

      {/* --- TOAST --- */}
      {alerta.visivel && (
        <div
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 z-50 transform transition-all duration-300 ${alerta.tipo === "sucesso" ? "bg-green-500" : "bg-red-500"}`}
        >
          {alerta.mensagem}
        </div>
      )}
    </div>
  );
}
