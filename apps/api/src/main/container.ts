import { AuthService } from "../contexts/identity/application/auth-service";
import { Argon2Hasher, DrizzleResetTokenRepository, DrizzleSessionRepository, DrizzleUserRepository } from "../contexts/identity/infrastructure/drizzle-repositories";
import { CatalogService } from "../contexts/catalog/application/catalog-service";
import { DrizzleCatalogCache } from "../contexts/catalog/infrastructure/drizzle-cache";
import { Open5eHttpGateway } from "../contexts/catalog/infrastructure/open5e-gateway";
import type { Open5eGateway } from "../contexts/catalog/domain/catalog";
import { CharacterService } from "../contexts/characters/application/character-service";
import { DrizzleCharacterRepository } from "../contexts/characters/infrastructure/drizzle-repository";
import { CreateCharacterFromWizard } from "../contexts/character-creation/application/create-character-from-wizard";
import { InventoryService } from "../contexts/inventory/application/inventory-service";
import { DrizzleInventoryRepository } from "../contexts/inventory/infrastructure/drizzle-repository";
import { SpellcastingService } from "../contexts/spellcasting/application/spellcasting-service";
import { DrizzleSpellBookRepository } from "../contexts/spellcasting/infrastructure/drizzle-repository";
import { SharingService } from "../contexts/sharing/application/sharing-service";
import { DrizzleShareLinkRepository } from "../contexts/sharing/infrastructure/drizzle-repository";
import type { CharacterAccess } from "../shared-kernel/auth";
import { InMemoryEventBus } from "../shared-kernel/domain-event";
import type { PasswordHasher } from "../contexts/identity/domain/user";
import type { Db } from "./db";

export interface Overrides {
  gateway?: Open5eGateway;
  hasher?: PasswordHasher;
}

/** Composition root: único lugar donde se conectan contextos, puertos y adaptadores. */
export function crearContainer(db: Db, overrides: Overrides = {}) {
  const events = new InMemoryEventBus();

  const auth = new AuthService(
    new DrizzleUserRepository(db),
    new DrizzleSessionRepository(db),
    overrides.hasher ?? new Argon2Hasher(),
    new DrizzleResetTokenRepository(db)
  );

  const catalog = new CatalogService(overrides.gateway ?? new Open5eHttpGateway(), new DrizzleCatalogCache(db));

  // Characters necesita leer/escribir secciones de otros contextos, y estos necesitan
  // comprobar la propiedad del personaje: el ciclo se rompe con un acceso diferido.
  const acceso: CharacterAccess = { assertOwner: (u, c) => characters.assertOwner(u, c) };

  const inventory = new InventoryService(new DrizzleInventoryRepository(db), acceso);
  const spellcasting = new SpellcastingService(new DrizzleSpellBookRepository(db), acceso);
  const sharing = new SharingService(new DrizzleShareLinkRepository(db), acceso);

  const characters: CharacterService = new CharacterService(
    new DrizzleCharacterRepository(db),
    { listMany: (ids) => inventory.listMany(ids), replace: (id, items) => inventory.replace(id, items) },
    { getMany: (ids) => spellcasting.getMany(ids), replace: (id, libro) => spellcasting.replace(id, libro) },
    { statusMany: (ids) => sharing.statusMany(ids) },
    events
  );

  const creation = new CreateCharacterFromWizard(catalog, characters);

  // Borrar un personaje limpia lo que otros contextos guardan sobre él.
  events.subscribe("CharacterDeleted", async (e) => {
    const { characterId } = e as unknown as { characterId: string };
    await Promise.all([inventory.eliminarDe(characterId), spellcasting.eliminarDe(characterId), sharing.eliminarDe(characterId)]);
  });

  return { events, auth, catalog, characters, inventory, spellcasting, sharing, creation };
}

export type Container = ReturnType<typeof crearContainer>;
