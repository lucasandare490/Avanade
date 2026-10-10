import type { ButtonHTMLAttributes } from 'react';
type Propriedades = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'secundario' | 'destrutivo' | 'icone';
  ocupado?: boolean;
};
/** Botão comum: ação sem envio implícito; formulários declaram type="submit". */
export function Botao({
  variante = 'secundario',
  ocupado = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...restante
}: Propriedades) {
  return (
    <button
      {...restante}
      type={type}
      disabled={disabled || ocupado}
      aria-busy={ocupado || undefined}
      className={`${variante === 'icone' ? 'botao-icone' : `botao ${variante}`} ${className}`}
    >
      {children}
    </button>
  );
}
