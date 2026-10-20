
/** Usuario ya autenticado, tal como lo ven el resto de contextos: solo su id. */
export interface AuthenticatedUser {
  id: string;
}

/**
 * Puerto compartido: lo implementa el contexto Characters y lo consumen los
 * contextos que cuelgan de un personaje (Inventory, Spellcasting, Sharing).
 */
export interface CharacterAccess {
  assertOwner(userId: string, characterId: string): Promise<void>;
}

