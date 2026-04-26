"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Zap, LayoutGrid, Sun, Download } from "lucide-react";
import * as XLSX from "xlsx";

type Project = {
  id: string;
  name: string;
  createdAt: string;
  modulePower: number;
  totalKwp: number;
  totalModules: number;
  _count: {
    units: number;
  };
  units: {
    code: string;
    name: string;
    monthlyCons: number;
    dailyCons: number;
    requiredKwp: number;
    requiredModules: number;
  }[];
};

export default function Historico() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/calculations")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar histórico");
        return res.json();
      })
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar o histórico de projetos.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const exportToExcel = (project: Project) => {
    const exportData = [
      ["Código de Instalação", "Nome da Unidade", "Média Mensal (kWh)", "Consumo Diário (kWh/dia)", "kWp Necessário", "Qtd. Módulos"]
    ];

    project.units.forEach(u => {
      exportData.push([u.code, u.name, u.monthlyCons.toString(), u.dailyCons.toString(), u.requiredKwp.toString(), u.requiredModules.toString()]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    worksheet["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dimensionamento");
    
    const fileName = project.name ? project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'projeto';
    XLSX.writeFile(workbook, `Dimensionamento_${fileName}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-3 rounded-xl text-white shadow-lg">
              <HistoryIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico de Projetos</h1>
              <p className="text-slate-500 font-medium">Seus dimensionamentos salvos</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
            Nova Simulação
          </Link>
        </header>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-medium">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Sun className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum projeto salvo</h3>
            <p className="text-slate-500 mb-6">Você ainda não salvou nenhuma simulação fotovoltaica.</p>
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              Criar meu primeiro projeto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 p-6 flex flex-col h-full group">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 text-xs uppercase font-bold mb-1 tracking-wider">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Potência Total
                    </div>
                    <div className="text-lg font-bold text-slate-800">{project.totalKwp.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">kWp</span></div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 text-xs uppercase font-bold mb-1 tracking-wider">
                      <LayoutGrid className="w-3 h-3 text-blue-500" />
                      Qtd Módulos
                    </div>
                    <div className="text-lg font-bold text-slate-800">{project.totalModules} <span className="text-xs font-normal text-slate-500">unid.</span></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    {project._count.units} {project._count.units === 1 ? "unidade" : "unidades"}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => exportToExcel(project)}
                      title="Baixar Planilha"
                      className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <span className="text-blue-600 font-medium flex items-center bg-blue-50 px-2 py-1 rounded-md">
                      {project.modulePower}W
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
