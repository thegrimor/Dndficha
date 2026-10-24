import type { WizardRequest } from "../../domain/character-builder";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { currentUser, type RequireAuth } from "../../../../main/http/auth";
import type { CreateCharacterFromWizard } from "../../application/create-character-from-wizard";

const ability = z.enum(["str", "dex", "con", "int", "wis", "cha"]);

const wizardRequestSchema = z.object({
  edition: z.enum(["2014", "2024"]),
  name: z.string().max(100),
  raceId: z.string().nullable(),
  classId: z.string().nullable(),
  backgroundId: z.string().nullable(),
  raceAbilityChoices: z.array(ability).max(6),
  chosenClassSkills: z.array(z.string()).max(18),
  chosenBackgroundLanguages: z.array(z.string()).max(10),
  backgroundBonus: z.object({
    mode: z.enum(["split", "even"]),
    plus2: ability.nullable(),
    plus1: ability.nullable(),
  }),
  originFeat: z.object({
    mode: z.enum(["catalog", "manual"]),
    chosenFeat: z.object({ name: z.string(), description: z.string() }).nullable(),
    manualName: z.string(),
    manualDescription: z.string(),
  }),
  scoreMethod: z.enum(["array", "manual"]),
  baseScores: z.object({ str: z.number(), dex: z.number(), con: z.number(), int: z.number(), wis: z.number(), cha: z.number() }),
});

export function characterCreationRoutes(creation: CreateCharacterFromWizard, requireAuth: RequireAuth) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();

    r.post("/character-creation", { preHandler: requireAuth, schema: { body: wizardRequestSchema } }, async (request, reply) =>
      reply.status(201).send({ character: await creation.execute(currentUser(request).id, request.body as WizardRequest) })
    );
  };
}
