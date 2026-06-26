interface InfoCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  corBorda?: string;
  corValor?: string;
}

export function InfoCard({
  titulo,
  valor,
  subtitulo,
  corBorda = "border-l-blue-500",
  corValor = "text-gray-800 dark:text-white",
}: InfoCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 border-l-4 ${corBorda} flex justify-between items-center transition-colors duration-300`}
    >
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {subtitulo}
          </p>
        )}
      </div>
      <p className={`text-4xl font-bold mt-2 ${corValor}`}>{valor}</p>
    </div>
  );
}
