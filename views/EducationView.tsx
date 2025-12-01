import React from 'react';
import { BookOpen, Sigma, Scale, AlertOctagon } from 'lucide-react';

export const EducationView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-12 max-w-4xl mx-auto space-y-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-heading font-bold text-white mb-4">Matemáticas del Azar</h1>
        <p className="text-slate-400 text-lg">Entendiendo los modelos probabilísticos detrás del entretenimiento digital.</p>
      </div>

      {/* Card 1: House Edge */}
      <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-[#B23A48]">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-[#B23A48]/10 rounded-lg text-[#B23A48]">
                <Scale size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-3">La Ventaja de la Casa (House Edge)</h2>
                <div className="prose prose-invert text-slate-300">
                    <p className="mb-4">
                        En cualquier juego de casino, las probabilidades matemáticas siempre favorecen a la casa. Esto se conoce como <strong>Valor Esperado Negativo (-EV)</strong> para el jugador.
                    </p>
                    <p className="text-sm bg-[#0B0B0C] p-4 rounded-lg border border-white/10 font-mono">
                        Ejemplo Ruleta Europea:<br/>
                        Pagos por acertar número: 35 a 1.<br/>
                        Posibilidades totales: 37 (números 0-36).<br/>
                        Margen: (1/37) * 35 - (36/37) * 1 = <strong>-2.7%</strong>
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Card 2: RNG */}
      <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-[#D4C28A]">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-[#D4C28A]/10 rounded-lg text-[#D4C28A]">
                <Sigma size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-3">Generadores de Números Aleatorios (RNG)</h2>
                <div className="prose prose-invert text-slate-300">
                    <p>
                        Los casinos online legítimos utilizan PRNG (Pseudo-Random Number Generators) auditados. Estos algoritmos aseguran que cada resultado sea:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                        <li>Estadísticamente independiente del anterior.</li>
                        <li>Impredecible sin la semilla (seed) inicial.</li>
                        <li>Uniformemente distribuido a largo plazo.</li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Card 3: Falacia del Apostador */}
      <section className="glass-panel p-8 rounded-2xl border-l-4 border-l-[#1C8C6E]">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1C8C6E]/10 rounded-lg text-[#1C8C6E]">
                <AlertOctagon size={32} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-3">La Falacia del Apostador</h2>
                <div className="prose prose-invert text-slate-300">
                    <p>
                        La creencia errónea de que si un evento ocurre con más frecuencia de lo normal durante un período, ocurrirá con menos frecuencia en el futuro (o viceversa).
                    </p>
                    <blockquote className="mt-4 border-l-2 border-slate-600 pl-4 italic text-slate-400">
                        "Ha salido rojo 5 veces seguidas, ¡seguro ahora sale negro!" <br/>
                        <strong>Falso.</strong> La ruleta no tiene memoria. La probabilidad sigue siendo ~48.6%.
                    </blockquote>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
};