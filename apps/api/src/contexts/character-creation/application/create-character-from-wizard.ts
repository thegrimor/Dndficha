import { DOTES_SRD, trasfondoDesdeOpen5e, type DoteElegida } from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";
import type { CatalogService } from "../../catalog/application/catalog-service";
import type { CharacterService, PersonajeDto } from "../../characters/application/character-service";
import { extraerCore } from "../../characters/domain/character";
import { construirPersonaje, type SolicitudWizard } from "../domain/character-builder";

export class CreateCharacterFromWizard {
  constructor(
    private catalog: CatalogService,
    private characters: CharacterService
  ) {}

  async ejecutar(userId: string, solicitud: SolicitudWizard): Promise<PersonajeDto> {
    if (!solicitud.trasfondoId) throw new DomainError("validation", "Falta el trasfondo", "background_required");

    // El trasfondo se toma del catálogo, nunca de lo que mande el cliente.
    const trasfondo = trasfondoDesdeOpen5e(await this.catalog.obtenerTrasfondo(solicitud.edicion, solicitud.trasfondoId));
    const nuevo = construirPersonaje(solicitud, trasfondo, resolverDote(solicitud));

    const { edicion, inventory, spells, ...nucleo } = nuevo.sheet;
    return this.characters.crear(userId, {
      name: nuevo.name,
      race: nuevo.race,
      class: nuevo.class,
      level: nuevo.level,
      background: nuevo.background,
      alignment: null,
      imageUrl: null,
      edition: edicion,
      core: extraerCore({ edicion, inventory, spells, ...nucleo }),
      inventory,
      spells,
    });
  }
}

function resolverDote({ doteOrigen, edicion }: SolicitudWizard): DoteElegida | null {
  if (edicion !== "2024") return null;
  if (doteOrigen.modo === "manual") {
    const nombre = doteOrigen.manualNombre.trim();
    if (!nombre) return null;
    return { nombre: nombre.slice(0, 200), descripcion: doteOrigen.manualDescripcion.trim().slice(0, 5000) };
  }
  // Del catálogo: se usa la descripción oficial del servidor, no la que envía el cliente.
  const dote = DOTES_SRD.find((d) => d.nombre === doteOrigen.doteElegida?.nombre);
  return dote ? { nombre: dote.nombre, descripcion: dote.descripcion } : null;
}
