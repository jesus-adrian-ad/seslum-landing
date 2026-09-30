/**
 * Validación de nombres de íconos contra el catálogo de una sección.
 *
 * El contenido llega de JSON con los íconos como texto libre; esta comprobación
 * corre en el build estático, así un nombre mal capturado detiene la
 * publicación con la ruta exacta del error en vez de dejar un hueco en la página.
 */

export function isInCatalog<Name extends string>(catalog: readonly Name[], value: string): value is Name {
  return (catalog as readonly string[]).includes(value);
}

export function assertIconName<Name extends string>(catalog: readonly Name[], value: string, path: string): Name {
  if (!isInCatalog(catalog, value)) {
    throw new Error(`Ícono desconocido "${value}" en ${path}. Disponibles: ${catalog.join(", ")}.`);
  }
  return value;
}
