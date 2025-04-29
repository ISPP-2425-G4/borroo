# Monetización de la aplicación Borro
## Ingeniería del Software y Práctica Profesional (ISPP)

![](../imagenes/borrooLogo.png) 

### Grupo: Borro (Equipo de Desarrollo)

### Miembros:
- David Blanco Mora
- Pablo Díaz Ordóñez
- Pablo Espinosa Naranjo
- Jesús Fernández Rodríguez
- Francisco Fernández Mota
- Javier García Rodríguez
- Miguel González Ortiz
- Álvaro Martín Muñoz
- Ignacio Naredo Bernardos
- Javier Nieto Vicioso
- Marco Padilla Gómez
- Miguel Palomo García
- Luis Javier Periáñez Franco
- Alexander Picón Garrote
- Santiago Rosado Raya
- Julia Sánchez Márquez
- Alejandro Sevillano Barea

### Fecha: 29/04/2025

### Entregable: PPL

---

### Historial de versiones

| Fecha      | Versión | Descripción                                                       | Entrega | Contribuyente(s)        |
| :--------- | :------ | :---------------------------------------------------------------- | :------ | :---------------------- |
| 29/04/2025 | 1.0     | Creación inicial del documento de monetización para Borro         | PPL     | Basado en prompt de usuario |
|            |         |                                                                   |         |                         |

## Contenido

1.  [Resumen](#resumen)
2.  [Introducción](#intro)
3.  [Funcionalidades clave y valor para el usuario](#valor-usuario)
4.  [Modelo de Ingresos](#modelo-ingresos)
5.  [Estimación de Costos e Ingresos a corto y medio plazo](#estimacion)
6.  [Bibliografía](#bib)

<div id='resumen'></div>

## 1. Resumen

Borro es una aplicación web diseñada para facilitar el alquiler de objetos entre particulares y permitir a los usuarios publicar solicitudes de objetos que necesitan alquilar. La plataforma conecta a personas que poseen objetos infrautilizados con aquellas que necesitan un acceso temporal a los mismos, fomentando la economía colaborativa y el consumo responsable. Borro ofrece una alternativa económica y sostenible a la compra, al tiempo que permite a los propietarios generar ingresos pasivos.

El modelo de negocio se centrará principalmente en un sistema de comisiones por transacción, aplicando una tarifa al arrendatario (quien alquila) y una menor al arrendador (propietario del objeto). Se contempla también la posibilidad de introducir funcionalidades premium para usuarios frecuentes o propietarios con múltiples artículos. La viabilidad del proyecto se apoya en la conveniencia, el ahorro potencial para los usuarios, la generación de ingresos para los propietarios y la creación de una comunidad basada en la confianza (mediante valoraciones y perfiles verificados), superando la barrera de la desconfianza inicial inherente al préstamo entre desconocidos.

<div id='intro'></div>

## 2. Introducción

Este documento detalla la estrategia de monetización propuesta para la aplicación web Borro. Se describen las funcionalidades que aportan valor diferencial a los usuarios, el modelo de ingresos seleccionado basado en comisiones por transacción, y una estimación preliminar de los costos asociados y los ingresos potenciales a corto y medio plazo. El objetivo es establecer un marco económico sostenible para el crecimiento y mantenimiento de la plataforma.

<div id='valor-usuario'></div>

## 3. Funcionalidades clave y valor para el usuario

La propuesta de valor de Borro se centra en ofrecer una solución centralizada, segura y conveniente para el alquiler temporal de objetos y la solicitud de los mismos. Aunque un usuario podría intentar buscar objetos en otras plataformas o pedir prestado a conocidos, Borro ofrece ventajas significativas que justifican su uso y el modelo de comisiones:

1.  **Conveniencia y Ahorro:** Acceder a objetos específicos (herramientas, equipo deportivo, cámaras, disfraces, etc.) solo cuando se necesitan, sin incurrir en el costo total de compra ni en el problema de almacenamiento. Esto es especialmente valioso para usos puntuales o esporádicos, como reflejan los perfiles de usuario (Álvaro, Carmen, Diego, Lucía).
2.  **Generación de Ingresos:** Permite a los propietarios monetizar activos que de otro modo estarían parados, generando ingresos extra con poco esfuerzo.
3.  **Amplia Selección y Descubrimiento:** Facilita encontrar una variedad de objetos disponibles en la comunidad local, superando las limitaciones de la red personal de contactos.
4.  **Funcionalidad de Solicitud:** Una característica distintiva es la posibilidad de publicar una necesidad ("Necesito alquilar X objeto para tal fecha"). Esto invierte el flujo, permitiendo a los propietarios responder a demandas existentes.
5.  **Seguridad y Confianza:** Implementación de perfiles de usuario, sistema de valoraciones y reseñas mutuas (arrendador y arrendatario), pasarela de pago segura. Se podría explorar la opción de un seguro básico o fianza gestionada por la plataforma para mitigar riesgos de daños o pérdidas (esto añadiría complejidad y coste, pero aumentaría la confianza).
6.  **Proceso Estructurado:** Facilita la comunicación, la reserva, el pago y la logística de entrega/devolución a través de la plataforma.
7.  **Comunidad y Sostenibilidad:** Fomenta la economía circular y un consumo más consciente, conectando a personas con necesidades complementarias dentro de su entorno. La posible colaboración con negocios locales (mencionada en las personas) podría añadir una capa extra de confianza y oferta.

Al igual que plataformas como Airbnb, Wallapop o Vinted (que los perfiles de usuario ya utilizan), Borro cobra por la intermediación, la seguridad y la conveniencia que ofrece, creando un mercado eficiente donde antes solo existían soluciones fragmentadas o informales.

<div id='modelo-ingresos'></div>

## 4. Modelo de Ingresos

Los ingresos de Borro se generarán a través de las siguientes vías principales:

1.  **Comisiones por Transacción:** Este será el flujo de ingresos principal.
    * **Comisión al Arrendatario (quien alquila):** Se aplicará una tarifa de servicio sobre el precio del alquiler fijado por el propietario. Esta comisión podría situarse entre el **10% y el 15%**. Cubre los costos operativos de la plataforma, el procesamiento de pagos, el soporte y el valor añadido de la conveniencia y seguridad.
    * **Comisión al Arrendador (propietario):** Se aplicará una comisión menor sobre los ingresos generados por el propietario por cada alquiler completado. Esta podría ser del **3% al 5%**. Se busca que sea lo suficientemente baja para incentivar la publicación de objetos en la plataforma.
    * *Ejemplo:* Si un objeto se alquila por 20€, el arrendatario pagaría 20€ + 3€ (comisión del 15%) = 23€. El propietario recibiría 20€ - 1€ (comisión del 5%) = 19€. La plataforma ingresaría 4€.

2.  **Funcionalidades Premium (Potencial futuro):** A medida que la plataforma crezca, se podrían introducir opciones de pago para mejorar la experiencia de ciertos usuarios:
    * **Para Propietarios:**
        * *Listados Destacados:* Pagar una pequeña tarifa para que sus objetos aparezcan en posiciones preferentes en los resultados de búsqueda o en secciones especiales.
        * *Límite de Anuncios Ampliado:* Si se establece un límite de anuncios gratuitos, ofrecer un plan de suscripción mensual (ej. 5-10€/mes) para publicar un número ilimitado o mayor de objetos.
        * *Analíticas Avanzadas:* Ofrecer estadísticas sobre el rendimiento de sus anuncios.
    * **Para Empresas (Potencial futuro):** Si se decide integrar a negocios de alquiler locales, se podría crear un plan específico para ellos con herramientas de gestión de inventario y tarifas adaptadas.

**Captación Inicial de Oferta (Propietarios):**
Para lanzar la plataforma, será crucial contar con una base inicial de objetos disponibles. Esto se puede lograr mediante:
* **Outreach directo:** Contactar activamente a perfiles de usuario potenciales (estudiantes, familias, aficionados al bricolaje) identificados en la fase de análisis (como los perfiles de Álvaro, Carmen, Diego, Lucía).
* **Incentivos iniciales:** Ofrecer comisiones reducidas o nulas para los primeros "X" alquileres a los propietarios pioneros.
* **Pequeñas campañas locales:** Promoción en universidades, centros cívicos, redes sociales locales.
* **Explorar colaboraciones:** Contactar con pequeñas tiendas o talleres locales (como se sugiere en las personas) para ver si estarían interesados en listar parte de su stock en Borro.

<div id='estimacion'></div>

## 5. Estimación de Costos e Ingresos a corto y medio plazo

### Costos Estimados

Basándonos en la estructura del equipo (18 miembros) y el periodo de desarrollo (aprox. 4 meses, Feb-May 2025), y tomando como referencia otros proyectos similares, podemos estimar:

* **CAPEX (Gastos de Capital Iniciales):** Incluye el coste estimado del desarrollo inicial, diseño, infraestructura inicial, etc. Podríamos estimar una cifra en el rango de **€80,000 - €100,000**. Usaremos **€90,000** como placeholder.
* **OPEX (Gastos Operativos Mensuales):** Incluye hosting, mantenimiento de la plataforma, soporte al cliente básico, costes de pasarela de pago, marketing inicial, posibles seguros básicos. Estimamos un OPEX mensual de **€3,000**. (OPEX Anual: €36,000).

**Estimación de Costos:**
* **Corto Plazo (Primeros 6 meses, incluyendo 4 meses post-lanzamiento):**
    CAPEX + (4 meses * OPEX) = €90,000 + (4 * €3,000) = **€102,000**
* **Medio Plazo (Primeros 2 años):**
    CAPEX + (24 meses * OPEX) = €90,000 + (24 * €3,000) = €90,000 + €72,000 = **€162,000**

### Ingresos Estimados

La estimación de ingresos es inherentemente incierta al inicio, pero podemos hacer un ejercicio basado en suposiciones:

* **Supuestos:**
    * Precio medio de alquiler por transacción: **€15**
    * Comisión total media por transacción (suma de arrendador y arrendatario): **18%** (ej. 13% arrendatario + 5% arrendador) -> Ingreso medio por transacción: €15 * 18% = **€2.70**
    * Volumen de transacciones (muy conservador):
        * Meses 1-6 post-lanzamiento: Promedio de 150 transacciones/mes
        * Meses 7-12: Promedio de 400 transacciones/mes
        * Año 2: Promedio de 800 transacciones/mes
    * Ingresos por Premium (asumiendo bajo impacto inicial): €100/mes a partir del mes 7.

**Estimación de Ingresos:**
* **Corto Plazo (Primeros 6 meses post-lanzamiento):**
    * Ingresos por comisiones: (6 meses * 150 transacciones/mes * €2.70/transacción) = **€2,430**
    * Ingresos Premium: €0
    * Total Corto Plazo (6 meses): **~€2,430** *(Claramente insuficiente para cubrir costes iniciales, lo cual es normal)*
* **Medio Plazo (Primeros 2 años):**
    * Año 1:
        * Meses 1-6: €2,430
        * Meses 7-12: (6 meses * 400 transacciones/mes * €2.70/transacción) + (6 meses * €100/mes Premium) = €6,480 + €600 = €7,080
        * Total Año 1: €2,430 + €7,080 = **€9,510**
    * Año 2:
        * Ingresos por comisiones: (12 meses * 800 transacciones/mes * €2.70/transacción) = €25,920
        * Ingresos Premium: (12 meses * €150/mes - asumiendo ligero crecimiento) = €1,800
        * Total Año 2: **€27,720**
    * **Total Medio Plazo (2 años):** €9,510 + €27,720 = **€37,230**

**Análisis Preliminar:**
Con estas estimaciones conservadoras, los ingresos de los dos primeros años (€37,230) no cubrirían los costos operativos de ese periodo (€72,000) ni mucho menos el CAPEX inicial. Esto subraya la **importancia crítica de la adopción temprana y el crecimiento del volumen de transacciones**. El punto de equilibrio requerirá un volumen significativamente mayor de alquileres mensuales o la introducción exitosa de planes premium más rentables. Será fundamental invertir en marketing y estrategias de crecimiento para alcanzar la escala necesaria. La viabilidad dependerá de superar las proyecciones iniciales de transacciones mensuales.

<div id='bib'></div>

## 6. Bibliografía

*Para esta versión inicial, no se han consultado fuentes externas específicas más allá del material proporcionado (ejemplo Eventbride y personas). Se recomienda consultar estudios sobre:*
* [1] Estudios de mercado sobre la economía colaborativa (Sharing Economy) en España.
* [2] Análisis de modelos de comisiones en plataformas P2P similares (Wallapop, Vinted, Airbnb, Getaround).
* [3] Datos sobre el mercado potencial de alquiler de objetos específicos (herramientas, equipos deportivos, etc.) en el área de Sevilla.
