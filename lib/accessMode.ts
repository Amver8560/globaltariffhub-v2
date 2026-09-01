// Controla el estado del producto durante la apertura anticipada.
// Por defecto: acceso público abierto. Para cerrar módulos tras el 4/9 sin
// reconstruir la web, definir NEXT_PUBLIC_ACCESS_MODE="closed" en el entorno.
export const PUBLIC_ACCESS_MODE =
  (process.env.NEXT_PUBLIC_ACCESS_MODE || "open").toLowerCase() !== "closed";
