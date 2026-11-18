# Planner Comercial — Split Tributario

[Português](README.md) · [English](README.en.md) · **Español**

Proyecto del **Squad 19** de la Residencia Tecnológica **Grow Up 2026.2** (Porto Digital y Faculdade Senac de Pernambuco, Recife, Brasil), hecho con la empresa asociada **Avanade**.

**Véalo funcionando ahora:** https://avanade-frontend-xi.vercel.app/ (la API en el plan gratuito de Render puede tardar hasta 1 minuto en activarse en el primer acceso).

## Instalar y ejecutar

**Requisitos:** Git, JDK 21, Node.js 20.19+ (o 22.12+), Python 3 y curl. No se necesita Docker.

**Linux o macOS, un solo comando** (inicia la API con base de datos local y el sitio):

```bash
git clone https://github.com/lucasandare490/Avanade.git && cd Avanade && ./scripts/dev.sh
```

**Windows (PowerShell)**, en dos terminales, en la carpeta del proyecto:

```powershell
.\scripts\iniciar-backend-local.ps1 -Jdk 'C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot'
```

```powershell
npm.cmd --prefix frontend ci; npm.cmd run dev
```

**Solo la demostración, sin Java** (datos ficticios en el navegador):

```bash
cd frontend && npm ci && VITE_MODO_DADOS=demo npm run dev
```

**Cómo confirmar que funcionó**

1. Abra http://127.0.0.1:5173: aparece la pantalla de entrada de Planner Comercial.
2. Haga clic en **Iniciar sesión** y después en **Regístrese** para crear una tienda vacía. O inicie sesión con `gerente1@demo.local` y la contraseña generada en `backend/.local/demo-password`.
3. La API responde `{"status":"UP"}` en http://127.0.0.1:8080/actuator/health.

Use el menú para cambiar la interfaz a español o inglés y el tema a claro, oscuro o del sistema.

## El problema

La Reforma Tributaria del consumo de Brasil (Enmienda Constitucional 132/2023 y Ley Complementaria 214/2025) crea los impuestos IBS y CBS e introduce el **split payment**: la parte del impuesto se separa automáticamente **en el momento en que el cliente paga**, y el comerciante recibe solo el valor neto.

Hoy, el dinero del impuesto entra en la caja junto con la venta y solo sale semanas después, en la fecha de pago del impuesto. En ese intervalo funciona como **capital de trabajo**: paga proveedores, inventario y salarios. Con el split payment, ese dinero deja de entrar. El pequeño y mediano comerciante pierde capital de trabajo de una sola vez. Esa es la **descapitalización**. Sin planificación, un negocio que vende bien puede quedarse sin caja para pagar sus cuentas.

Por lo tanto, el problema central **no es cómo pagar el impuesto de cada venta**, porque el split payment ya lo hace solo. Es **cómo mantener la caja sana cuando el impuesto sale en el momento de la venta**.

## La solución

**Planner Comercial** ayuda al comerciante a ver la descapitalización y anticiparse a ella:

- muestra, venta por venta, cuánto fue al impuesto, cuánto a la tasa del medio de pago y cuánto **entró de verdad en la caja**;
- calcula la caja realizada (entradas netas menos gastos pagados) y la caja por semana;
- proyecta la caja de los próximos días y avisa cuando el escenario indica déficit;
- simula ventas antes de que ocurran, para entender el impacto de cada porcentaje;
- explica los números en lenguaje simple, con análisis por reglas, sin IA externa y sin alterar valores.

**Persistencia real en PostgreSQL. Los pagos, el split y los tributos son simulados:** no hay transferencia de dinero ni pago de impuestos. Los porcentajes de ejemplo no son legislación. El crédito simulado y la cancelación quedan para una evolución futura.

## Qué tiene el sistema

| Área | Cómo funciona |
|---|---|
| Inicio de sesión seguro | Bloqueo temporal de 15 minutos tras 5 contraseñas erróneas seguidas. En cada error se muestra cuántos intentos quedan. También tiene recuperación de cuenta por correo, botón de ojo para ver la contraseña, **Recordarme** y **¿Aún no tiene una cuenta? Regístrese** |
| Tema | Claro, oscuro o según el sistema, en todas las pantallas, elegido en el menú |
| Idiomas | Portugués, inglés y español en todas las pantallas, elegidos en el menú |
| Explicaciones | Un ícono **i** junto a cada dato. Muestra qué significa al pasar el ratón, con la tecla Tab o con un toque en el celular |
| Ventas y split | Pago simulado, división en impuesto, tasa y neto, regla histórica y reanudación de falla parcial |
| Gastos | Registro de gasto pagado, búsqueda y sugerencia de categoría confirmada por la persona |
| Caja | Totales del servidor, composición diaria, caja semanal, proyección manual con aviso de déficit |
| Informes | Ventas, gastos y composición tributaria por período, con CSV completo |
| Android | Cliente POS en Kotlin, local e integrado por HTTPS. La prueba en dispositivo físico está pendiente |

## Equipo y qué hizo cada persona

| Persona | Rol en el squad | Contribuciones registradas |
|---|---|---|
| **Thayná Batista da Silva** | Scrum Master; diseño y prototipado; investigación; documentación de requisitos; README en portugués, inglés y español; pruebas | Prototipo de alta fidelidad en [Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design); investigación y levantamiento de requisitos de Split Pay y de Planner Comercial; documentación de requisitos. En la entrega final: corrección del problema central (descapitalización); inicio de sesión con bloqueo, aviso de intentos, recuperación por correo, botón de ojo, Recordarme y Regístrese; temas claro, oscuro y del sistema; idiomas PT/EN/ES; íconos **i** con explicaciones; verificadores de auditoría; nuevas pruebas de backend, unitarias y de navegador |
| **Kássio Lima de Oliveira** | Código del proyecto y despliegue | Integración entre backend y frontend con persistencia; recuperación de operaciones; flujo seguro de recuperación de contraseña; configuración de Supabase; despliegue en Render (API) y Vercel (sitio); monitoreo y rutina de respaldo |
| **Lucas André Cardoso de Lima** | Código del front-end | Primera entrega de los frontends web y Android; comparación de tendencias; contratos de integración; revisión de los 516 criterios con evidencias; caja semanal, registro e informes |
| **Kleysson Teixeira da Cruz Junior** | Entrevistas con usuarios | Entrevistas con usuarios; revisión del README del MVP; [repositorio inicial](https://github.com/Kleyssonteixeirapf/projeto-split-tributario) del proyecto |
| **Heitor Sette Couto de Melo** | Pitch | Presentación del pitch deck |
| **James Bernardino da Silva Neto** | Integrante del squad | — |

Mentor: **Eryson Moreira** (Avanade). Grupo: GROWUP-SENAC-N2. La autoría de cada cambio en el código puede verificarse en el [historial de commits](https://github.com/lucasandare490/Avanade/commits/main) y en [CHANGELOG.md](CHANGELOG.md).

## Documentos del proyecto

- [Prototipo en Figma](https://www.figma.com/make/tJXFL2o4nYoZnZARUCkBLQ/Planner-Comercial-MVP-Design) y [documentación de diseño, tokens y capturas](documentacao/design/README.md)
- [Carpeta de documentación del Squad 19](https://drive.google.com/drive/folders/1_4WXflZ5LvJ3yTbEgqiSV5Qw5S6jHoYp?usp=sharing)
- [Análisis y levantamiento de requisitos de Split Pay y Planner Comercial](https://docs.google.com/document/d/1QoIXru-uVBmSDMy6YKjTAkVvk_0Q2kk5_WnfubFtVPU/edit?usp=sharing)
- [Documentación de requisitos (V2)](https://docs.google.com/document/d/13OdFEBoY3y_6TPt6pDJQwXycZW9mGdwy/edit?usp=sharing)
- [Documento de la entrega final (PDF, en portugués)](documentacao/entrega-final/Entrega_Final_GrowUp_Senac_Squad19_Planner_Comercial_Avanade.pdf)
- [Entrega parcial](https://docs.google.com/document/d/16FiTQW6DRE6WRpWBlSeXzVHnP-lr3DfT/edit?usp=sharing)
- [Registro de la entrega final](documentacao/ENTREGA-FINAL-2026-11-18.md) (en portugués): qué cambió, cómo se probó y qué quedó pendiente
- [Contrato de la API](backend/docs/API.md) · [Integración con Supabase](scripts/supabase/README.md) · [Operación en producción](documentacao/OPERACAO-PRODUCAO.md)

## Pruebas y auditoría

| Qué probar | Comando |
|---|---|
| Backend (Java, base de datos embebida) | `cd backend && ./mvnw test` |
| Frontend (unitarias) | `cd frontend && npm test` |
| Tipos y build | `cd frontend && npm run build` |
| Navegador: inicio de sesión, tema, idiomas, íconos **i** y accesibilidad (inicia la demostración solo) | `cd frontend && npm run test:e2e:entrega` |
| Navegador contra la API real | con `./scripts/dev.sh` en ejecución: `cd frontend && npx playwright test` |
| Todas las frases de la interfaz traducidas | `node scripts/auditoria/verificar-traducoes.mjs` |
| Ningún crédito de IA en el proyecto | `node scripts/auditoria/verificar-sem-credito-ia.mjs` |
| Tema oscuro al día con el tema claro | `cd frontend && node scripts/gerar-tema-escuro.mjs --verificar` |
| Sitio y API publicados actualizados | `node scripts/auditoria/site-producao.mjs` y `node scripts/auditoria/api-producao.mjs` |

El sistema es auditable: cada cambio tiene un commit con autoría, el [CHANGELOG](CHANGELOG.md) resume lo que cambió y cualquier persona puede ejecutar los verificadores de arriba.

## Seguridad y privacidad

- Contraseñas con BCrypt. El token de acceso es opaco, revocable y expira. La contraseña nunca se guarda en el navegador.
- El bloqueo de inicio de sesión está en el servidor, guarda solo el hash del correo y responde igual para correos registrados y no registrados, así nadie descubre qué cuentas existen.
- **Recordarme** guarda el token en este dispositivo hasta que la sesión expire. No lo use en una computadora compartida.
- El enlace de recuperación vale por 30 minutos y una sola vez, y el token viaja en el fragmento `#` de la URL, que no llega a los registros del servidor. El envío del correo requiere SMTP configurado en el servidor (`SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `PASSWORD_RESET_FROM`, `PASSWORD_RESET_LINK_BASE`). Sin eso, la solicitud se acepta y no se envía nada. Paso a paso (en portugués): [configurar el correo de recuperación](documentacao/CONFIGURAR-EMAIL-RECUPERACAO.md). En la demostración local, el correo se simula con un enlace en la pantalla.
- Ninguna contraseña, clave ni base de datos local entra en el repositorio (`.env`, `backend/.local` y similares están en `.gitignore`).

## Carpetas

- `frontend/`: sitio en React 19, TypeScript y Vite. Pantallas en `src/telas`; tema, idiomas y explicaciones en `src/preferencias`.
- `backend/`: API en Java 21, Spring Boot, PostgreSQL y Flyway (migrations V1–V8).
- `android-pos/`: aplicación POS en Kotlin.
- `scripts/`: ejecución local, Supabase, hosting y `auditoria/`.
- `documentacao/`: estado, decisiones, operación e historial.
