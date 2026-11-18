import { useEffect, useState } from 'react';
import { Languages, SunMoon } from 'lucide-react';
import { aplicarTema, aoMudarTema, temaAtual, type Tema } from '../preferencias/tema';
import { idiomas, tradutor, type Idioma } from '../preferencias/idioma';

/** Tema (claro, escuro ou do sistema) e idioma (PT, EN, ES), disponíveis em todas as telas. */
export function SeletorPreferencias({ flutuante = false }: { flutuante?: boolean }) {
  const [tema, setTema] = useState<Tema>(temaAtual());
  const [idioma, setIdioma] = useState<Idioma>(tradutor.idioma);
  useEffect(() => aoMudarTema(setTema), []);
  useEffect(() => {
    const parar = tradutor.aoMudar(setIdioma);
    return () => {
      parar();
    };
  }, []);
  return (
    <div className={`seletor-preferencias ${flutuante ? 'flutuante' : ''}`} role="group" aria-label="Preferências de exibição">
      <label className="preferencia">
        <SunMoon size={15} aria-hidden="true" />
        <span className="somente-leitor">Tema</span>
        <select value={tema} onChange={(e) => aplicarTema(e.target.value as Tema)} aria-label="Tema">
          <option value="claro">Claro</option>
          <option value="escuro">Escuro</option>
          <option value="sistema">Usar tema do sistema</option>
        </select>
      </label>
      <label className="preferencia">
        <Languages size={15} aria-hidden="true" />
        <span className="somente-leitor">Idioma</span>
        <select value={idioma} onChange={(e) => tradutor.definir(e.target.value as Idioma)} aria-label="Idioma">
          {idiomas.map((i) => (
            <option key={i.valor} value={i.valor} lang={i.lang}>
              {i.nome}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
