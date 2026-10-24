import { CLASSES_SRD } from "@dndficha/rules";
import type { InjectOptions } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ACOLYTE_2024, createApp, fakeGateway, registerUser } from "./helpers";

let ctx: Awaited<ReturnType<typeof createApp>>;
const gateway = fakeGateway({ "backgrounds:2024": [ACOLYTE_2024] });

beforeAll(async () => {
  ctx = await createApp({ gateway });
});
afterAll(() => ctx.close());

const inject = (opts: InjectOptions) => ctx.app.inject(opts);

describe("health", () => {
  it("responds ok when the database is available", async () => {
    const res = await inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
  });
});

describe("identity", () => {
  it("registers, returns the session and allows /auth/me by Bearer and by cookie", async () => {
    const res = await inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "Ana@Example.com", username: "ana", password: "secure-password-1" },
    });
    expect(res.statusCode).toBe(201);
    const cookie = res.cookies.find((c) => c.name === "sid")!;
    expect(cookie.httpOnly).toBe(true);

    const byCookie = await inject({ method: "GET", url: "/auth/me", cookies: { sid: cookie.value } });
    expect(byCookie.json().user.email).toBe("ana@example.com");

    const byBearer = await inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${res.json().token}` } });
    expect(byBearer.statusCode).toBe(200);
  });

  it("rejects a duplicate email, short passwords and wrong credentials", async () => {
    const payload = { email: "dup@example.com", username: "dup", password: "secure-password-1" };
    expect((await inject({ method: "POST", url: "/auth/register", payload })).statusCode).toBe(201);
    expect((await inject({ method: "POST", url: "/auth/register", payload })).statusCode).toBe(409);
    expect((await inject({ method: "POST", url: "/auth/register", payload: { ...payload, email: "x@example.com", password: "corta" } })).statusCode).toBe(422);
    expect((await inject({ method: "POST", url: "/auth/login", payload: { email: "dup@example.com", password: "something-else-long" } })).statusCode).toBe(401);
    expect((await inject({ method: "POST", url: "/auth/login", payload: { email: "nadie@example.com", password: "something-else-long" } })).statusCode).toBe(401);
    expect((await inject({ method: "POST", url: "/auth/login", payload: { email: "dup@example.com", password: "secure-password-1" } })).statusCode).toBe(200);
  });

  it("invalidates the session on sign out", async () => {
    const { auth } = await registerUser(ctx.app);
    expect((await inject({ method: "POST", url: "/auth/logout", headers: auth })).statusCode).toBe(204);
    expect((await inject({ method: "GET", url: "/auth/me", headers: auth })).statusCode).toBe(401);
  });

  it("requires a session on protected routes", async () => {
    expect((await inject({ method: "GET", url: "/characters" })).statusCode).toBe(401);
    expect((await inject({ method: "GET", url: "/catalog/spells" })).statusCode).toBe(401);
  });
});

describe("password recovery (no email)", () => {
  const ADMIN = "a".repeat(40);
  let admin: Awaited<ReturnType<typeof createApp>>;
  beforeAll(async () => {
    admin = await createApp({ env: { ADMIN_TOKEN: ADMIN, WEB_URL: "https://dndficha.example" } });
  });
  afterAll(() => admin.close());

  const registerIn = (c: typeof admin, email: string) =>
    c.app.inject({ method: "POST", url: "/auth/register", payload: { email, username: "amigo", password: "old-password-1" } });
  const generate = (c: typeof admin, email: string, token = ADMIN) =>
    c.app.inject({ method: "POST", url: "/admin/reset-tokens", headers: { "x-admin-token": token }, payload: { email } });

  it("the admin generates a single-use link and the user sets a new password", async () => {
    const reg = await registerIn(admin, "amigo@example.com");
    const oldSession = reg.json().token;

    const res = await generate(admin, "Amigo@Example.com");
    expect(res.statusCode).toBe(200);
    const { token, url } = res.json();
    expect(url).toBe(`https://dndficha.example/restablecer?token=${token}`);

    const reset = (password: string) => admin.app.inject({ method: "POST", url: "/auth/reset-password", payload: { token, password } });
    expect((await reset("corta")).statusCode).toBe(422);
    expect((await reset("new-password-1")).statusCode).toBe(204);
    // single use
    expect((await reset("other-password-2")).statusCode).toBe(422);

    // the old password no longer works, the new one does, and earlier sessions are closed
    const login = (password: string) => admin.app.inject({ method: "POST", url: "/auth/login", payload: { email: "amigo@example.com", password } });
    expect((await login("old-password-1")).statusCode).toBe(401);
    expect((await login("new-password-1")).statusCode).toBe(200);
    expect((await admin.app.inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${oldSession}` } })).statusCode).toBe(401);
  });

  it("a new link invalidates the previous one and unknown tokens are rejected", async () => {
    await registerIn(admin, "otro@example.com");
    const first = (await generate(admin, "otro@example.com")).json().token;
    const second = (await generate(admin, "otro@example.com")).json().token;
    const reset = (token: string) => admin.app.inject({ method: "POST", url: "/auth/reset-password", payload: { token, password: "new-password-1" } });

    expect((await reset(first)).statusCode).toBe(422);
    expect((await reset("inventado")).statusCode).toBe(422);
    expect((await reset(second)).statusCode).toBe(204);
  });

  it("protects the admin route", async () => {
    expect((await generate(admin, "amigo@example.com", "b".repeat(40))).statusCode).toBe(403);
    expect((await generate(admin, "amigo@example.com", "")).statusCode).toBe(403);
    expect((await generate(admin, "nadie@example.com")).statusCode).toBe(404);
  });

  it("the admin route does not exist without ADMIN_TOKEN", async () => {
    const res = await inject({ method: "POST", url: "/admin/reset-tokens", headers: { "x-admin-token": ADMIN }, payload: { email: "x@example.com" } });
    expect(res.statusCode).toBe(404);
  });
});

describe("characters", () => {
  it("creates, edits the full sheet and reads it back", async () => {
    const { auth } = await registerUser(ctx.app);
    const created = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Thorin" } })).json().character;
    expect(created.sheet.edition).toBe("2014");
    expect(created.is_public).toBe(false);

    const sheet = {
      ...created.sheet,
      abilityScores: { ...created.sheet.abilityScores, str: 18 },
      inventory: [{ slug: "espada", name: "Espada", type: "Arma", source: "manual" }],
      spells: { slots: { "1": { total: 2, used: 0 } }, known: [{ slug: "luz", name: "Luz", level: 0, source: "manual" }] },
    };
    const res = await inject({ method: "PATCH", url: `/characters/${created.id}`, headers: auth, payload: { name: "Thorin II", level: 3, sheet } });
    expect(res.statusCode).toBe(200);

    const fetched = (await inject({ method: "GET", url: `/characters/${created.id}`, headers: auth })).json().character;
    expect(fetched.name).toBe("Thorin II");
    expect(fetched.level).toBe(3);
    expect(fetched.sheet.abilityScores.str).toBe(18);
    expect(fetched.sheet.inventory[0]).toMatchObject({ slug: "espada", quantity: 1, equipped: false });
    expect(fetched.sheet.spells.known[0].name).toBe("Luz");
    expect(fetched.sheet.spells.slots["1"]).toEqual({ total: 2, used: 0 });
  });

  it("does not let users see or touch another user's sheets", async () => {
    const a = await registerUser(ctx.app);
    const b = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: a.auth, payload: { name: "Privado" } })).json().character;

    expect((await inject({ method: "GET", url: `/characters/${character.id}`, headers: b.auth })).statusCode).toBe(404);
    expect((await inject({ method: "PATCH", url: `/characters/${character.id}`, headers: b.auth, payload: { name: "x" } })).statusCode).toBe(404);
    expect((await inject({ method: "DELETE", url: `/characters/${character.id}`, headers: b.auth })).statusCode).toBe(404);
    expect((await inject({ method: "POST", url: `/characters/${character.id}/inventory`, headers: b.auth, payload: { item: { slug: "a", name: "A", type: "x", source: "manual" } } })).statusCode).toBe(404);
    expect((await inject({ method: "PUT", url: `/characters/${character.id}/share`, headers: b.auth })).statusCode).toBe(404);
    expect((await inject({ method: "GET", url: "/characters", headers: b.auth })).json().characters).toHaveLength(0);
  });

  it("enforces the domain invariants", async () => {
    const { auth } = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Reglas" } })).json().character;
    const patch = (payload: object) => inject({ method: "PATCH", url: `/characters/${character.id}`, headers: auth, payload });

    expect((await patch({ level: 21 })).statusCode).toBe(422);
    expect((await patch({ sheet: { ...character.sheet, abilityScores: { ...character.sheet.abilityScores, str: 31 } } })).statusCode).toBe(422);
    expect((await patch({ sheet: { ...character.sheet, combat: { ...character.sheet.combat, hp: { current: 99, max: 10, temp: 0 } } } })).statusCode).toBe(422);
    expect((await patch({ sheet: { ...character.sheet, edition: "2024" } })).statusCode).toBe(422);
  });

  it("deleting the sheet cleans up inventory, spells and the public link", async () => {
    const { auth } = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Efímero" } })).json().character;
    await inject({ method: "POST", url: `/characters/${character.id}/inventory`, headers: auth, payload: { item: { slug: "a", name: "A", type: "x", source: "manual" } } });
    const { shareSlug } = (await inject({ method: "PUT", url: `/characters/${character.id}/share`, headers: auth })).json();

    expect((await inject({ method: "DELETE", url: `/characters/${character.id}`, headers: auth })).statusCode).toBe(204);
    expect((await inject({ method: "GET", url: `/public/characters/${shareSlug}` })).statusCode).toBe(404);
    expect((await ctx.container.inventory.listMany([character.id])).get(character.id)).toBeUndefined();
  });
});

describe("sharing", () => {
  it("exposes the sheet by slug without a session while the link is enabled", async () => {
    const { auth, userId } = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Público" } })).json().character;

    const { shareSlug } = (await inject({ method: "PUT", url: `/characters/${character.id}/share`, headers: auth })).json();
    const publicResponse = await inject({ method: "GET", url: `/public/characters/${shareSlug}` });
    expect(publicResponse.statusCode).toBe(200);
    expect(publicResponse.json().character.name).toBe("Público");
    expect(publicResponse.body).not.toContain(userId);

    // Re-enabling keeps the same slug
    await inject({ method: "DELETE", url: `/characters/${character.id}/share`, headers: auth });
    expect((await inject({ method: "GET", url: `/public/characters/${shareSlug}` })).statusCode).toBe(404);
    const other = (await inject({ method: "PUT", url: `/characters/${character.id}/share`, headers: auth })).json();
    expect(other.shareSlug).toBe(shareSlug);

    const fetched = (await inject({ method: "GET", url: `/characters/${character.id}`, headers: auth })).json().character;
    expect(fetched).toMatchObject({ is_public: true, share_slug: shareSlug });
  });
});

describe("inventory and spellcasting", () => {
  it("prevents duplicates and allows removal", async () => {
    const { auth } = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Mochila" } })).json().character;
    const item = { slug: "pocion", name: "Poción", type: "Poción", source: "open5e", data: { name: "Poción" } };
    const url = `/characters/${character.id}/inventory`;

    expect((await inject({ method: "POST", url, headers: auth, payload: { item } })).statusCode).toBe(201);
    expect((await inject({ method: "POST", url, headers: auth, payload: { item } })).statusCode).toBe(409);
    expect((await inject({ method: "DELETE", url: `${url}/pocion`, headers: auth })).statusCode).toBe(204);
    expect((await inject({ method: "GET", url, headers: auth })).json().items).toHaveLength(0);
  });

  it("spends spell slots and recovers them with a long rest", async () => {
    const { auth } = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Mago" } })).json().character;
    await inject({ method: "PATCH", url: `/characters/${character.id}`, headers: auth, payload: { sheet: { ...character.sheet, spells: { slots: { "1": { total: 1, used: 0 } }, known: [] } } } });

    const base = `/characters/${character.id}/spellbook`;
    expect((await inject({ method: "POST", url: `${base}/slots/1/use`, headers: auth })).statusCode).toBe(200);
    expect((await inject({ method: "POST", url: `${base}/slots/1/use`, headers: auth })).statusCode).toBe(409);
    const afterRest = await inject({ method: "POST", url: `${base}/long-rest`, headers: auth });
    expect(afterRest.json().spellbook.slots["1"].used).toBe(0);
  });

  it("does not accept duplicate spells", async () => {
    const { auth } = await registerUser(ctx.app);
    const character = (await inject({ method: "POST", url: "/characters", headers: auth, payload: { name: "Bardo" } })).json().character;
    const spell = { slug: "luz", name: "Luz", level: 0, source: "open5e", data: {} };
    const url = `/characters/${character.id}/spellbook/spells`;
    expect((await inject({ method: "POST", url, headers: auth, payload: { spell } })).statusCode).toBe(201);
    expect((await inject({ method: "POST", url, headers: auth, payload: { spell } })).statusCode).toBe(409);
  });
});

describe("character creation (wizard)", () => {
  const characterClass = CLASSES_SRD.find((c) => c.id === "fighter")!;
  const input = () => ({
    edition: "2024",
    name: "Aldric",
    raceId: "human",
    classId: "fighter",
    backgroundId: "srd-2024_acolyte",
    raceAbilityChoices: [],
    chosenClassSkills: characterClass.availableSkills.slice(0, characterClass.skillChoiceCount),
    chosenBackgroundLanguages: [],
    backgroundBonus: { mode: "split", plus2: "int", plus1: "wis" },
    originFeat: { mode: "catalog", chosenFeat: { name: "Alerta", description: "manipulada por el cliente" }, manualName: "", manualDescription: "" },
    scoreMethod: "array",
    baseScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  });

  it("builds the level 1 sheet on the server", async () => {
    const { auth } = await registerUser(ctx.app);
    const res = await inject({ method: "POST", url: "/character-creation", headers: auth, payload: input() });
    expect(res.statusCode).toBe(201);
    const { character } = res.json();

    expect(character).toMatchObject({ name: "Aldric", class: characterClass.name, level: 1, background: "Acolyte" });
    expect(character.sheet.edition).toBe("2024");
    // 12 + 2 (INT) and 10 + 1 (WIS) from the 2024 background bonus
    expect(character.sheet.abilityScores).toMatchObject({ int: 14, wis: 11 });
    expect(character.sheet.combat.hp.max).toBe(characterClass.hitDie + 1);
    // The feat comes from the server's catalog, not from the text the client sent
    const feat = character.sheet.features.find((f: { name: string }) => f.name === "Alerta");
    expect(feat.description).not.toContain("manipulada");
  });

  it("rejects choices that break the rules", async () => {
    const { auth } = await registerUser(ctx.app);
    const submit = (changes: object) => inject({ method: "POST", url: "/character-creation", headers: auth, payload: { ...input(), ...changes } });

    expect((await submit({ baseScores: { str: 18, dex: 18, con: 18, int: 18, wis: 18, cha: 18 } })).statusCode).toBe(422);
    expect((await submit({ chosenClassSkills: ["arcana", "arcana"] })).statusCode).toBe(422);
    expect((await submit({ backgroundBonus: { mode: "split", plus2: "int", plus1: "int" } })).statusCode).toBe(422);
    expect((await submit({ raceId: "invented" })).statusCode).toBe(422);
    expect((await submit({ backgroundId: "no-existe" })).statusCode).toBe(404);
    expect((await submit({ name: "   " })).statusCode).toBe(422);
  });
});

describe("catalog", () => {
  it("serves from the persistent cache instead of repeating the Open5e call", async () => {
    const { auth } = await registerUser(ctx.app);
    const before = gateway.calls;
    const a = await inject({ method: "GET", url: "/catalog/backgrounds?edition=2024", headers: auth });
    const b = await inject({ method: "GET", url: "/catalog/backgrounds?edition=2024", headers: auth });
    expect(a.json().results).toHaveLength(1);
    expect(b.json().results).toHaveLength(1);
    expect(gateway.calls - before).toBeLessThanOrEqual(1);
  });

  it("rejects unknown resources", async () => {
    const { auth } = await registerUser(ctx.app);
    expect((await inject({ method: "GET", url: "/catalog/inventado", headers: auth })).statusCode).toBe(400);
  });
});
