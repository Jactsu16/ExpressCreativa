# Seguridad de despliegue

La web funciona de forma estática y no procesa pagos ni almacena formularios en un servidor. El archivo `_headers` contiene las políticas recomendadas para un despliegue compatible con Netlify o Cloudflare Pages.

Antes de publicar en otro proveedor, se deben trasladar los mismos encabezados a su configuración: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, protección contra iframes y `Permissions-Policy`.

## Requisitos pendientes antes de operar

- El panel `ssa.html` y el gestor local de tickets fueron retirados. No reincorporarlos hasta contar con autenticación real en servidor y una fuente central segura para los datos.
- Usar HTTPS obligatorio.
- No incorporar claves, contraseñas, tokens ni datos bancarios en HTML o JavaScript.
- Implementar un backend propio y protección contra abuso antes de recibir formularios directamente.
- Revisar la CSP al incorporar una pasarela de pago, analítica o un nuevo proveedor externo.
- Realizar copia de seguridad y pruebas en un entorno de ensayo antes de cada publicación.
