
/** Already authenticated user, as the rest of the contexts see it: just its id. */
export interface AuthenticatedUser {
  id: string;
}

/**
 * Shared port: implemented by the Characters context and consumed by the
 * contexts that hang off a character (Inventory, Spellcasting, Sharing).
 */
export interface CharacterAccess {
  assertOwner(userId: string, characterId: string): Promise<void>;
}

