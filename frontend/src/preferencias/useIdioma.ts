import { useEffect, useState } from 'react';
import { tradutor, type Idioma } from './idioma';

/** Idioma atual; re-renderiza o componente quando a pessoa troca o idioma. */
export function useIdioma(): Idioma {
  const [idioma, setIdioma] = useState<Idioma>(tradutor.idioma);
  useEffect(() => {
    const parar = tradutor.aoMudar(setIdioma);
    return () => {
      parar();
    };
  }, []);
  return idioma;
}
