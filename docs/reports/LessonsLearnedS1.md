<div align=center>

# BORROO

![](../imagenes/borrooLogo.png)  <!-- Meter un . mas en la ruta si el documento está dentro de otra carpeta para que detecte el logo-->

## Informe de Lecciones Aprendidas - Entrega #S1

### PPL – G4
**Repositorio:** [Borroo](https://github.com/ISPP-2425-G4/borroo)  
**Base de conocimientos:** [BorrooKB](https://borrookb.netlify.app/)  

Fecha: 21/04/2025  

</div>

**Miembros:**  
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

---

## **Histórico de modificaciones**

| Fecha      | Versión | Realizada por   | Descripción de los cambios |
| ---------- | ------- | --------------- | -------------------------- |
| 21-04-2025 | v1.0    | Alexander Picón Garrote | Creación del documento y primera versión     |
| 21-04-2025 | v1.1    | Javier García Rodríguez | Ampliación de información     |

---


## 1. Análisis detallado de las condiciones de fallo

Durante la Entrega #S1 se identificaron varios problemas críticos que comprometieron la evaluación del trabajo por parte del revisor. El más grave fue un **error 500** que impedía el acceso a la aplicación desplegada, inutilizando completamente el sistema desde el punto de entrada.

En la entrega del Sprint 1, se detectaron problemas graves que se encontraban declarados dentro del documento de las failure conditions.

Los problemas detallados son:

- El primer problema y el principal constituía en un **error 500 en el software**. Este problema ocurre debido a un error tratando de desplegar el software correspondiente al Sprint 2. Se cometió un error mientras se investigaba la forma de migrar los datos de un desplegable al otro. Concretamente se borró la base de datos del Sprint 1 por error.

- El documento **KBReport**, no contiene la información correspondiente que se añadía a la KB, respectivamente. Además, se mencionaban varios documentos, pero no se adjuntaron los enlaces ni el contenido de estos. Concretamente, los documentos eran:

  - Actas de reunión de los días 9 y 10 de marzo
  - pilotUsers
  - performanceEvaluation
  - timeEffortReport
  - AIusage
  - commitmentAgreement
  - pilotUsersCommitmentAgreement
  - pilotUsersPerformanceEvaluation
  - revision

La información proporcionada era escasa y resultaba pobre en contenido y análisis.

- Las firmas del **CommitmentAgreement** no se encontraban en la carpeta correspondiente a la entrega del S1. No se adjuntó la información necesaria para que el profesor que evaluase la entrega supiese que el CommitmentAgreement que se firmó al inicio de la asignatura, contemplaba el período completo del desarrollo de la asignatura. Estos documentos se encontraban en una carpeta exterior, no dentro. Lo que se adjuntó fue el modelo base sin firmas, algo erróneo.


- El documento **timeEffortReport**, a pesar de contener la información del tiempo invertido por cada miembro del grupo, no contenía gráficas que facilitasen la visualización de la información. Se abordó este tema durante varias semanas en las clases y en el feedback, y no se adjuntó.


- A la hora de completar el **formulario de registro**, este no contaba con las validaciones necesarias en los campos correspondientes. Además, tampoco se indicaba qué campos eran obligatorios y cuáles no. Solo aparecía uno una vez se rellenasen todos los campos.


## 2. Problemas detectados y su relación con las condiciones de fallo

| Problema   | Detectado antes | Detectado después | Detectado por el revisor |
|------------|-----------------|-------------------|--------------------------|
| Error 500 al desplegar la app   |  ❌  |  ✅  |  ✅  |
| **KBreport** incompleto        |  ⚠️  |  ✅  |  ✅  |
| Falta de firmas en **CommitmentAgreement** |  ❌  |  ✅  |  ✅  |
| Falta de gráficos en **timeEffortReport**   |  ❌  |  ✅  |  ✅  |
| Formulario sin validación       |  ❌  |  ✅  |  ✅   |


## 3. Metodología de desarrollo de software seguida y roles de todos los miembros del equipo

El equipo de Borroo está compuesto por 17 miembros, organizados en subgrupos multidisciplinares según áreas funcionales para facilitar la especialización y eficiencia en cada etapa del proyecto.

La organización del equipo es la siguiente:

- Product Manager: Jefe del proyecto.
- Jefes de subgrupo (3): Supervisión de los miembros de su grupo, coordinación con los otros 2 subgrupos y organización y gestión de tareas asignadas.
- Equipo de Desarrollo: Encargado de la implementación del sistema, tanto en frontend como en backend.
- Equipo de Documentación: Responsable de la redacción, actualización y control de los entregables documentales.
- Equipo de Pruebas: Dedicado a la verificación funcional del sistema y reporte de incidencias.
- Equipo de Despliegue: Enfocado en la preparación, ejecución y mantenimiento del entorno productivo.

Aunque no se sigue una metodología ágil de forma estricta, se incorporan algunas prácticas inspiradas en enfoques ágiles, como entregas iterativas, reuniones de seguimiento y revisiones periódicas de avances.

Detalladamente, cada miembro tenía un rol:

- **Subgrupo 1**   
  - Alexander Picón Garrote  
  - Álvaro Martín Muñoz  
  - Alejandro Sevillano Barea  
  - Ignacio Naredo Bernardos  
  - Pablo Espinosa Naranjo  
  - Marco Padilla Gómez  

- **Subgrupo 2**
  - Francisco Fernández Mota  
  - Santiago Rosado Raya  
  - Julia Sánchez Márquez  
  - Pablo Díaz Ordóñez  
  - Javier Nieto Vicioso  
  - David Blanco Mora  

- **Subgrupo 3**
  - Javier García Rodríguez  
  - Jesús Fernández Rodríguez  
  - Miguel González Ortiz  
  - Miguel Palomo García  
  - Luis Javier Periáñez Franco


Sin embargo, durante la iteración correspondiente a la Entrega #S1, se detectaron múltiples problemas organizativos:

- **Escasa coordinación entre subgrupos.**
- **Falta de liderazgo técnico claro.**
- **Ausencia de revisiones cruzadas entre áreas.**
- **Distribución de tareas desigual.**
- **Mala gestión del backlog y los issues.**


## 4. Análisis Detallado de los Problemas

### 4.1. Error 500 (Servidor)

- **Origen técnico:** Eliminación accidental de la base de datos durante tareas de mantenimiento sin respaldo.
- **Origen en el proceso:** Ausencia de pruebas tras el despliegue y falta de checklist final.
- **Responsables técnicos:** Equipo de despliegue.
- **Responsables funcionales:** Jefes de proyecto.
- **Mitigación técnica:** Backups automáticos y validaciones post-deploy.
- **Mitigación en proceso:** Validación obligatoria tras cada despliegue.
- **Estado:** *Resuelto*


### 4.2. `KBreport.md` incompleto

- **Origen técnico:** Proceso manual y no sistematizado para actualizar la KB.
- **Origen en el proceso:** Falta de revisión final y de pautas claras.
- **Responsables técnicos:** Equipo de documentación.
- **Responsables funcionales:** Coordinadores de subgrupo.
- **Mitigación técnica:** Automatización con plantillas.
- **Mitigación en proceso:** Validación cruzada.
- **Estado:** *Resuelto*


### 4.3. Falta de firmas en `Commitment Agreement`

- **Origen técnico:** No aplicable.
- **Origen en el proceso:** Descontrol en el seguimiento de documentos clave.
- **Responsables:** Todo el equipo y especialmente los jefes de proyecto.
- **Mitigación en proceso:** Checklist obligatoria de documentación.
- **Estado:** *Resuelto*


### 4.4. Ausencia de gráficos en `timeEffortReport.md`

- **Origen técnico:** Malinterpretación de requisitos.
- **Origen en el proceso:** No se revisó antes de entregar.
- **Responsables técnicos:** Subgrupo de documentación.
- **Mitigación técnica:** Generadores automáticos de gráficas.
- **Mitigación en proceso:** Revisión cruzada obligatoria.
- **Estado:** *Resuelto*


### 4.5. Formulario sin validación

- **Origen técnico:** Lógica de validación incompleta en frontend.
- **Origen en el proceso:** Fallo en pruebas funcionales previas a entrega.
- **Responsables técnicos:** Equipo frontend.
- **Responsables funcionales:** Equipo de QA y líderes técnicos.
- **Mitigación técnica:** Pruebas unitarias y funcionales obligatorias.
- **Mitigación en proceso:** QA como fase obligatoria.
- **Estado:** *Resuelto*


## 5. Conclusiones y Lecciones Aprendidas

Los errores evidencian carencias tanto técnicas como organizativas:

-  **Falta de planificación y seguimiento de issues**: Muchas issues fueron desarrolladas tarde y otras no se cerraron cuando fue debido.
-  **Carga de trabajo mal distribuida**: Algunos miembros asumieron un peso excesivo, mientras que otros participaron poco.
-  **Falta de revisiones de Pull Requests**: Se hicieron merges sin revisión o sin pruebas funcionales.
-  **Descoordinación entre subgrupos**: El backend y frontend avanzaban en paralelo sin sincronización, afectando la integración.
-  **Poca comunicación interna**: Cambios importantes no se comunicaban correctamente y se enteraban tarde otros equipos.
-  **Ausencia de testing sistemático**: No se planificaron ni ejecutaron pruebas completas antes de la entrega.
-  **Gestión reactiva y no preventiva**: Muchos problemas se detectaron solo tras la revisión, no antes.
-  **Documentación entregada sin control de calidad**: Varios documentos no fueron revisados antes de enviarlos.
-  **Checklist inexistente o ignorada**: No hubo confirmación de requisitos antes del momento de entrega.
-  **Poca participación en retrospectivas**: No se interiorizó la mejora continua como parte del ciclo ágil.


## 6. Acciones Inmediatas

Para las siguientes iteraciones, se implementarán los siguientes cambios estructurales:

-  **Checklists obligatorias para cada entrega** (con responsables designados).
-  **Revisión cruzada de documentación y código antes de entregar.**
-  **Backups y validación automática en el despliegue.**
-  **QA como fase integrada del flujo de desarrollo.**
-  **Automatización de gráficas e informes.**
-  **Asignación equitativa de tareas y seguimiento de carga real.**
-  **Canal de comunicación centralizado entre subgrupos.**
-  **Reuniones breves de coordinación inter-áreas.**
-  **Política estricta de revisiones en los PR.**
-  **Seguimiento riguroso de issues en GitHub.**

