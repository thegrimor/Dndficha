"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve `valor` retrasado `delayMs` milisegundos. Se usa para no disparar
 * una petición a /api/open5e/* en cada pulsación del buscador de texto.
 */
export function useDebounce<T>(valor: T, delayMs = 350): T {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const timeoutId = setTimeout(() => setValorDebounced(valor), delayMs);
    return () => clearTimeout(timeoutId);
  }, [valor, delayMs]);

  return valorDebounced;
}
