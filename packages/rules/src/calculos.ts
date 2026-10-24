import { bonificadorCompetenciaPorNivel } from "./constantes";

/** Modificador de una puntuación de característica: floor((score-10)/2). */
export function modificador(puntuacion: number): number {
  return Math.floor((puntuacion - 10) / 2);
}

/** Modificador con signo para mostrar en la ficha, ej. "+3" o "-1". */
export function modificadorConSigno(puntuacion: number): string {
  const mod = modificador(puntuacion);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function bonificadorCompetencia(nivel: number): number {
  return bonificadorCompetenciaPorNivel(nivel);
}

/** Bono de una salvación o habilidad: modificador + competencia (si aplica). */
export function bonoConCompetencia(
  puntuacionCaracteristica: number,
  nivel: number,
  tieneCompetencia: boolean,
  esExperto = false
): number {
  const base = modificador(puntuacionCaracteristica);
  if (!tieneCompetencia) return base;
  const multiplicador = esExperto ? 2 : 1;
  return base + bonificadorCompetencia(nivel) * multiplicador;
}

export function iniciativa(destreza: number): number {
  return modificador(destreza);
}

/** CA sin armadura: 10 + mod DEX. Si hay armadura equipada, se pasa su CA base. */
export function claseArmadura(destreza: number, caBaseArmadura = 10, bonoEscudo = 0): number {
  return caBaseArmadura + modificador(destreza) + bonoEscudo;
}

/** CD de salvación de un hechizo: 8 + competencia + mod de la característica de conjuro. */
export function cdSalvacionHechizo(
  nivel: number,
  modCaracteristicaConjuro: number
): number {
  return 8 + bonificadorCompetencia(nivel) + modCaracteristicaConjuro;
}

/** Bono de ataque con hechizos: competencia + mod de la característica de conjuro. */
export function bonoAtaqueHechizo(
  nivel: number,
  modCaracteristicaConjuro: number
): number {
  return bonificadorCompetencia(nivel) + modCaracteristicaConjuro;
}

/** Puntos de golpe iniciales a nivel 1: máximo del dado de golpe + mod CON. */
export function puntosGolpeIniciales(dadoGolpe: number, constitucion: number): number {
  return dadoGolpe + modificador(constitucion);
}
