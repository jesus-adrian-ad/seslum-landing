/**
 * Página 404 propia, sin estilos en línea, para respetar la CSP estricta.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="not-found container">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Esta página no existe</h1>
      <Link className="not-found__link chamfer-md" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
