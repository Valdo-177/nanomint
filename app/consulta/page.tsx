'use client';

import React, { useState } from 'react';
import { checkStudentStatus } from '@/app/actions/student';
import { Search, Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface EvaluationResult {
  status: boolean;
  data?: {
    estado: boolean;
    periodo: boolean;
  };
  error?: string;
}

export default function ConsultaEstudiante() {
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await checkStudentStatus(documento);
      setResult(data);
    } catch (err: any) {
      setError('No se pudo conectar con el servidor de evaluación.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 selection:bg-primary/30 font-inter">
      <div className="max-w-md w-full glass-panel rounded-lg overflow-hidden border border-outline/20 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Consulta de Evaluación
            </h1>
            <p className="text-foreground/60 text-sm">
              Ingresa tu documento para verificar el estado de tus evaluaciones docentes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleConsulta} className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Número de documento"
                className="w-full bg-surface-low border border-outline/30 rounded-md py-3 pl-10 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground text-sm font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !documento.trim()}
              className="w-full btn-primary py-3 rounded-md font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  PROCESANDO...
                </>
              ) : (
                'CONSULTAR ESTADO'
              )}
            </button>
          </form>

          {/* Results Area */}
          <div className="min-h-[140px] flex items-center justify-center border-t border-outline/10 pt-4">
            {!loading && !result && !error && (
              <div className="text-center space-y-2 opacity-30">
                <HelpCircle className="w-12 h-12 mx-auto" />
                <p className="text-xs uppercase tracking-tighter">Esperando consulta...</p>
              </div>
            )}

            {!loading && error && (
              <div className="space-y-4 w-full animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4 w-full animate-in slide-in-from-bottom-4 duration-500">
                {result.status === true && result.data ? (
                  <div className="space-y-4">
                    {result.data.estado === true ? (
                      <div className="space-y-3 p-5 rounded-lg bg-primary/10 border border-primary/20 text-center">
                        <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-1" />
                        <div>
                          <h3 className="text-primary font-bold">¡Todo al día!</h3>
                          <p className="text-foreground/70 text-xs mt-1">
                            Has completado todas tus evaluaciones pendientes. Puedes continuar con tu trámite.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 p-5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                        <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-1" />
                        <div>
                          <h3 className="text-yellow-400 font-bold">Evaluaciones Pendientes</h3>
                          <p className="text-foreground/70 text-xs mt-1">
                            Aún tienes evaluaciones por realizar en los periodos activos. Por favor, complétalas para continuar.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {result.data.periodo === false && (
                      <p className="text-[10px] text-center text-foreground/40 italic uppercase tracking-wider">
                        Nota: No se detectaron periodos de evaluación abiertos en este momento.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 w-full animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">
                        {result.error || (result.status === false ? 'No se pudo realizar la consulta.' : 'No se han encontrado datos para este estudiante.')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-surface-high/50 px-8 py-4 flex items-center justify-between border-t border-outline/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
            Universidad CUC
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
            © 2024
          </span>
        </div>
      </div>
    </div>
  );
}
