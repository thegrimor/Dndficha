import { CLASES_SRD } from "@dndficha/rules";
import type { InjectOptions } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ACOLITO_2024, crearApp, gatewayFalso, registrar } from "./helpers";

let ctx: Awaited<ReturnType<typeof crearApp>>;
const gateway = gatewayFalso({ "backgrounds:2024": [ACOLITO_2024] });

beforeAll(async () => {
  ctx = await crearApp({ gateway });
});
afterAll(() => ctx.cerrar());

const inyectar = (opts: InjectOptions) => ctx.app.inject(opts);

describe("health", () => {
  it("responde ok con la base disponible", async () => {
    const res = await inyectar({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
  });
});

describe("identity", () => {
  it("registra, devuelve la sesión y permite /auth/me por Bearer y por cookie", async () => {
    const res = await inyectar({
      method: "POST",
      url: "/auth/register",
      payload: { email: "Ana@Example.com", username: "ana", password: "contraseña-segura" },
    });
    expect(res.statusCode).toBe(201);
    const cookie = res.cookies.find((c) => c.name === "sid")!;
    expect(cookie.httpOnly).toBe(true);

    const porCookie = await inyectar({ method: "GET", url: "/auth/me", cookies: { sid: cookie.value } });
    expect(porCookie.json().user.email).toBe("ana@example.com");

    const porBearer = await inyectar({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${res.json().token}` } });
    expect(porBearer.statusCode).toBe(200);
  });

  it("rechaza correo duplicado, contraseñas cortas y credenciales erróneas", async () => {
    const payload = { email: "dup@example.com", username: "dup", password: "contraseña-segura" };
    expect((await inyectar({ method: "POST", url: "/auth/register", payload })).statusCode).toBe(201);
    expect((await inyectar({ method: "POST", url: "/auth/register", payload })).statusCode).toBe(409);
    expect((await inyectar({ method: "POST", url: "/auth/register", payload: { ...payload, email: "x@example.com", password: "corta" } })).statusCode).toBe(422);
    expect((await inyectar({ method: "POST", url: "/auth/login", payload: { email: "dup@example.com", password: "otra-cosa-larga" } })).statusCode).toBe(401);
    expect((await inyectar({ method: "POST", url: "/auth/login", payload: { email: "nadie@example.com", password: "otra-cosa-larga" } })).statusCode).toBe(401);
    expect((await inyectar({ method: "POST", url: "/auth/login", payload: { email: "dup@example.com", password: "contraseña-segura" } })).statusCode).toBe(200);
  });

  it("invalida la sesión al cerrar sesión", async () => {
    const { auth } = await registrar(ctx.app);
    expect((await inyectar({ method: "POST", url: "/auth/logout", headers: auth })).statusCode).toBe(204);
    expect((await inyectar({ method: "GET", url: "/auth/me", headers: auth })).statusCode).toBe(401);
  });

  it("exige sesión en las rutas protegidas", async () => {
    expect((await inyectar({ method: "GET", url: "/characters" })).statusCode).toBe(401);
    expect((await inyectar({ method: "GET", url: "/catalog/spells" })).statusCode).toBe(401);
  });
});

describe("recuperación de contraseña (sin correo)", () => {
  const ADMIN = "a".repeat(40);
  let admin: Awaited<ReturnType<typeof crearApp>>;
  beforeAll(async () => {
    admin = await crearApp({ env: { ADMIN_TOKEN: ADMIN, WEB_URL: "https://dndficha.example" } });
  });
  afterAll(() => admin.cerrar());

  const registrarEn = (c: typeof admin, email: string) =>
    c.app.inject({ method: "POST", url: "/auth/register", payload: { email, username: "amigo", password: "contraseña-vieja" } });
  const generar = (c: typeof admin, email: string, token = ADMIN) =>
    c.app.inject({ method: "POST", url: "/admin/reset-tokens", headers: { "x-admin-token": token }, payload: { email } });

  it("el admin genera un enlace de un solo uso y el usuario fija una contraseña nueva", async () => {
    const reg = await registrarEn(admin, "amigo@example.com");
    const sesionVieja = reg.json().token;

    const res = await generar(admin, "Amigo@Example.com");
    expect(res.statusCode).toBe(200);
    const { token, url } = res.json();
    expect(url).toBe(`https://dndficha.example/restablecer?token=${token}`);

    const reset = (password: string) => admin.app.inject({ method: "POST", url: "/auth/reset-password", payload: { token, password } });
    expect((await reset("corta")).statusCode).toBe(422);
    expect((await reset("contraseña-nueva-1")).statusCode).toBe(204);
    // un solo uso
    expect((await reset("otra-contraseña-2")).statusCode).toBe(422);

    // la contraseña vieja ya no vale, la nueva sí, y las sesiones anteriores se cierran
    const login = (password: string) => admin.app.inject({ method: "POST", url: "/auth/login", payload: { email: "amigo@example.com", password } });
    expect((await login("contraseña-vieja")).statusCode).toBe(401);
    expect((await login("contraseña-nueva-1")).statusCode).toBe(200);
    expect((await admin.app.inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${sesionVieja}` } })).statusCode).toBe(401);
  });

  it("un enlace nuevo anula el anterior y los enlaces caducan", async () => {
    await registrarEn(admin, "otro@example.com");
    const primero = (await generar(admin, "otro@example.com")).json().token;
    const segundo = (await generar(admin, "otro@example.com")).json().token;
    const reset = (token: string) => admin.app.inject({ method: "POST", url: "/auth/reset-password", payload: { token, password: "contraseña-nueva-1" } });

    expect((await reset(primero)).statusCode).toBe(422);
    expect((await reset("inventado")).statusCode).toBe(422);
    expect((await reset(segundo)).statusCode).toBe(204);
  });

  it("protege la ruta de administración", async () => {
    expect((await generar(admin, "amigo@example.com", "b".repeat(40))).statusCode).toBe(403);
    expect((await generar(admin, "amigo@example.com", "")).statusCode).toBe(403);
    expect((await generar(admin, "nadie@example.com")).statusCode).toBe(404);
  });

  it("la ruta de administración no existe sin ADMIN_TOKEN", async () => {
    const res = await inyectar({ method: "POST", url: "/admin/reset-tokens", headers: { "x-admin-token": ADMIN }, payload: { email: "x@example.com" } });
    expect(res.statusCode).toBe(404);
  });
});

describe("characters", () => {
  it("crea, edita la ficha completa y la lee de vuelta", async () => {
    const { auth } = await registrar(ctx.app);
    const creado = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Thorin" } })).json().character;
    expect(creado.sheet.edicion).toBe("2014");
    expect(creado.is_public).toBe(false);

    const sheet = {
      ...creado.sheet,
      abilityScores: { ...creado.sheet.abilityScores, str: 18 },
      inventory: [{ slug: "espada", nombre: "Espada", tipo: "Arma", fuente: "manual" }],
      spells: { slots: { "1": { total: 2, used: 0 } }, known: [{ slug: "luz", nombre: "Luz", nivel: 0, fuente: "manual" }] },
    };
    const res = await inyectar({ method: "PATCH", url: `/characters/${creado.id}`, headers: auth, payload: { name: "Thorin II", level: 3, sheet } });
    expect(res.statusCode).toBe(200);

    const leido = (await inyectar({ method: "GET", url: `/characters/${creado.id}`, headers: auth })).json().character;
    expect(leido.name).toBe("Thorin II");
    expect(leido.level).toBe(3);
    expect(leido.sheet.abilityScores.str).toBe(18);
    expect(leido.sheet.inventory[0]).toMatchObject({ slug: "espada", cantidad: 1, equipado: false });
    expect(leido.sheet.spells.known[0].nombre).toBe("Luz");
    expect(leido.sheet.spells.slots["1"]).toEqual({ total: 2, used: 0 });
  });

  it("no deja ver ni tocar fichas de otro usuario", async () => {
    const a = await registrar(ctx.app);
    const b = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: a.auth, payload: { name: "Privado" } })).json().character;

    expect((await inyectar({ method: "GET", url: `/characters/${ficha.id}`, headers: b.auth })).statusCode).toBe(404);
    expect((await inyectar({ method: "PATCH", url: `/characters/${ficha.id}`, headers: b.auth, payload: { name: "x" } })).statusCode).toBe(404);
    expect((await inyectar({ method: "DELETE", url: `/characters/${ficha.id}`, headers: b.auth })).statusCode).toBe(404);
    expect((await inyectar({ method: "POST", url: `/characters/${ficha.id}/inventory`, headers: b.auth, payload: { item: { slug: "a", nombre: "A", tipo: "x", fuente: "manual" } } })).statusCode).toBe(404);
    expect((await inyectar({ method: "PUT", url: `/characters/${ficha.id}/share`, headers: b.auth })).statusCode).toBe(404);
    expect((await inyectar({ method: "GET", url: "/characters", headers: b.auth })).json().characters).toHaveLength(0);
  });

  it("aplica las invariantes del dominio", async () => {
    const { auth } = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Reglas" } })).json().character;
    const patch = (payload: object) => inyectar({ method: "PATCH", url: `/characters/${ficha.id}`, headers: auth, payload });

    expect((await patch({ level: 21 })).statusCode).toBe(422);
    expect((await patch({ sheet: { ...ficha.sheet, abilityScores: { ...ficha.sheet.abilityScores, str: 31 } } })).statusCode).toBe(422);
    expect((await patch({ sheet: { ...ficha.sheet, combat: { ...ficha.sheet.combat, hp: { current: 99, max: 10, temp: 0 } } } })).statusCode).toBe(422);
    expect((await patch({ sheet: { ...ficha.sheet, edicion: "2024" } })).statusCode).toBe(422);
  });

  it("al borrar la ficha limpia inventario, hechizos y enlace público", async () => {
    const { auth } = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Efímero" } })).json().character;
    await inyectar({ method: "POST", url: `/characters/${ficha.id}/inventory`, headers: auth, payload: { item: { slug: "a", nombre: "A", tipo: "x", fuente: "manual" } } });
    const { shareSlug } = (await inyectar({ method: "PUT", url: `/characters/${ficha.id}/share`, headers: auth })).json();

    expect((await inyectar({ method: "DELETE", url: `/characters/${ficha.id}`, headers: auth })).statusCode).toBe(204);
    expect((await inyectar({ method: "GET", url: `/public/characters/${shareSlug}` })).statusCode).toBe(404);
    expect((await ctx.container.inventory.listMany([ficha.id])).get(ficha.id)).toBeUndefined();
  });
});

describe("sharing", () => {
  it("expone la ficha por slug sin sesión mientras el enlace esté activo", async () => {
    const { auth, userId } = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Público" } })).json().character;

    const { shareSlug } = (await inyectar({ method: "PUT", url: `/characters/${ficha.id}/share`, headers: auth })).json();
    const publica = await inyectar({ method: "GET", url: `/public/characters/${shareSlug}` });
    expect(publica.statusCode).toBe(200);
    expect(publica.json().character.name).toBe("Público");
    expect(publica.body).not.toContain(userId);

    // Reactivar conserva el mismo slug
    await inyectar({ method: "DELETE", url: `/characters/${ficha.id}/share`, headers: auth });
    expect((await inyectar({ method: "GET", url: `/public/characters/${shareSlug}` })).statusCode).toBe(404);
    const otra = (await inyectar({ method: "PUT", url: `/characters/${ficha.id}/share`, headers: auth })).json();
    expect(otra.shareSlug).toBe(shareSlug);

    const leida = (await inyectar({ method: "GET", url: `/characters/${ficha.id}`, headers: auth })).json().character;
    expect(leida).toMatchObject({ is_public: true, share_slug: shareSlug });
  });
});

describe("inventory y spellcasting", () => {
  it("evita duplicados y permite quitar", async () => {
    const { auth } = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Mochila" } })).json().character;
    const item = { slug: "pocion", nombre: "Poción", tipo: "Poción", fuente: "open5e", datos: { name: "Poción" } };
    const url = `/characters/${ficha.id}/inventory`;

    expect((await inyectar({ method: "POST", url, headers: auth, payload: { item } })).statusCode).toBe(201);
    expect((await inyectar({ method: "POST", url, headers: auth, payload: { item } })).statusCode).toBe(409);
    expect((await inyectar({ method: "DELETE", url: `${url}/pocion`, headers: auth })).statusCode).toBe(204);
    expect((await inyectar({ method: "GET", url, headers: auth })).json().items).toHaveLength(0);
  });

  it("gasta espacios de conjuro y los recupera con un descanso largo", async () => {
    const { auth } = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Mago" } })).json().character;
    await inyectar({ method: "PATCH", url: `/characters/${ficha.id}`, headers: auth, payload: { sheet: { ...ficha.sheet, spells: { slots: { "1": { total: 1, used: 0 } }, known: [] } } } });

    const base = `/characters/${ficha.id}/spellbook`;
    expect((await inyectar({ method: "POST", url: `${base}/slots/1/use`, headers: auth })).statusCode).toBe(200);
    expect((await inyectar({ method: "POST", url: `${base}/slots/1/use`, headers: auth })).statusCode).toBe(409);
    const tras = await inyectar({ method: "POST", url: `${base}/long-rest`, headers: auth });
    expect(tras.json().spellbook.slots["1"].used).toBe(0);
  });

  it("no admite hechizos duplicados", async () => {
    const { auth } = await registrar(ctx.app);
    const ficha = (await inyectar({ method: "POST", url: "/characters", headers: auth, payload: { name: "Bardo" } })).json().character;
    const spell = { slug: "luz", nombre: "Luz", nivel: 0, fuente: "open5e", datos: {} };
    const url = `/characters/${ficha.id}/spellbook/spells`;
    expect((await inyectar({ method: "POST", url, headers: auth, payload: { spell } })).statusCode).toBe(201);
    expect((await inyectar({ method: "POST", url, headers: auth, payload: { spell } })).statusCode).toBe(409);
  });
});

describe("character creation (wizard)", () => {
  const clase = CLASES_SRD.find((c) => c.id === "guerrero")!;
  const solicitud = () => ({
    edicion: "2024",
    nombre: "Aldric",
    razaId: "humano",
    claseId: "guerrero",
    trasfondoId: "srd-2024_acolyte",
    eleccionesCaracteristicaRaza: [],
    habilidadesClaseElegidas: clase.habilidadesDisponibles.slice(0, clase.numHabilidadesElegibles),
    idiomasTrasfondoElegidos: [],
    bonificadorTrasfondo: { modo: "reparto", mas2: "int", mas1: "wis" },
    doteOrigen: { modo: "catalogo", doteElegida: { nombre: "Alerta", descripcion: "manipulada por el cliente" }, manualNombre: "", manualDescripcion: "" },
    metodoPuntuaciones: "array",
    puntuacionesBase: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  });

  it("construye la ficha de nivel 1 en el servidor", async () => {
    const { auth } = await registrar(ctx.app);
    const res = await inyectar({ method: "POST", url: "/character-creation", headers: auth, payload: solicitud() });
    expect(res.statusCode).toBe(201);
    const { character } = res.json();

    expect(character).toMatchObject({ name: "Aldric", class: clase.nombre, level: 1, background: "Acolyte" });
    expect(character.sheet.edicion).toBe("2024");
    // 12 + 2 (INT) y 10 + 1 (WIS) por el bonificador del trasfondo 2024
    expect(character.sheet.abilityScores).toMatchObject({ int: 14, wis: 11 });
    expect(character.sheet.combat.hp.max).toBe(clase.dadoGolpe + 1);
    // La dote sale del catálogo del servidor, no del texto que mandó el cliente
    const dote = character.sheet.features.find((f: { nombre: string }) => f.nombre === "Alerta");
    expect(dote.descripcion).not.toContain("manipulada");
  });

  it("rechaza elecciones que incumplen las reglas", async () => {
    const { auth } = await registrar(ctx.app);
    const enviar = (cambios: object) => inyectar({ method: "POST", url: "/character-creation", headers: auth, payload: { ...solicitud(), ...cambios } });

    expect((await enviar({ puntuacionesBase: { str: 18, dex: 18, con: 18, int: 18, wis: 18, cha: 18 } })).statusCode).toBe(422);
    expect((await enviar({ habilidadesClaseElegidas: ["arcana", "arcana"] })).statusCode).toBe(422);
    expect((await enviar({ bonificadorTrasfondo: { modo: "reparto", mas2: "int", mas1: "int" } })).statusCode).toBe(422);
    expect((await enviar({ razaId: "inventada" })).statusCode).toBe(422);
    expect((await enviar({ trasfondoId: "no-existe" })).statusCode).toBe(404);
    expect((await enviar({ nombre: "   " })).statusCode).toBe(422);
  });
});

describe("catalog", () => {
  it("sirve desde la caché persistente en vez de repetir la llamada a Open5e", async () => {
    const { auth } = await registrar(ctx.app);
    const antes = gateway.llamadas;
    const a = await inyectar({ method: "GET", url: "/catalog/backgrounds?edicion=2024", headers: auth });
    const b = await inyectar({ method: "GET", url: "/catalog/backgrounds?edicion=2024", headers: auth });
    expect(a.json().results).toHaveLength(1);
    expect(b.json().results).toHaveLength(1);
    expect(gateway.llamadas - antes).toBeLessThanOrEqual(1);
  });

  it("rechaza recursos desconocidos", async () => {
    const { auth } = await registrar(ctx.app);
    expect((await inyectar({ method: "GET", url: "/catalog/inventado", headers: auth })).statusCode).toBe(400);
  });
});
