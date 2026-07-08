import { crearRouteHandlerOpen5e } from "@/lib/open5e/crear-route-handler";

export const GET = crearRouteHandlerOpen5e("monsters", ["type", "cr"]);
