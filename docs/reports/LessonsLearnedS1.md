# Informe de Lecciones Aprendidas - Entrega #S1

**Fecha:** 21 de abril de 2025  
**Equipo:** Borroo  


## 1. Análisis Detallado de las Condiciones de Fallo

Durante la Entrega #S1 se identificaron varios problemas críticos que comprometieron la evaluación del trabajo por parte del revisor. El más grave fue un **error 500** que impedía el acceso a la aplicación desplegada, inutilizando completamente el sistema desde el punto de entrada.

Además, se detectaron deficiencias graves en la documentación entregada:

- El archivo `KBreport.md` no incluía contenido actualizado ni enlaces funcionales a la base de conocimiento.
- El `Commitment Agreement` no contaba con todas las firmas del equipo.
- El archivo `timeEffortReport.md` carecía de gráficas que ayudaran a entender el esfuerzo invertido.
- El formulario de registro no contaba con validación de campos obligatorios, lo que constituía un fallo funcional crítico.


## 2. Problemas Detectados y su Relación con las Condiciones de Fallo

| Problema                                  | Detectado antes | Detectado después | Detectado por el revisor |
|-------------------------------------------|------------------|--------------------|---------------------------|
| Error 500 al desplegar la app             | ❌               | ✅                 | ✅                        |
| `KBreport.md` incompleto                  | ⚠️ (sospecha)    | ✅                 | ✅                        |
| Falta de firmas en `Commitment Agreement` | ❌               | ✅                 | ✅                        |
| Falta de gráficos en `timeEffortReport`   | ❌               | ✅                 | ✅                        |
| Formulario sin validación                 | ❌               | ✅                 | ✅                        |


## 3. Organización del Equipo y Metodología

El equipo Borroo está compuesto por 17 miembros, organizados en subgrupos según áreas funcionales bajo la metodología Scrum:

- **Jefes de Proyecto (3):** Supervisión del proyecto y gestión de entregables.
- **Equipo de Desarrollo:** Implementación del sistema (frontend y backend).
- **Equipo de Documentación:** Redacción y actualización de entregables.
- **Equipo de Pruebas:** Verificación funcional.
- **Equipo de Despliegue:** Gestión del entorno productivo.

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
- **Estado:** ✅ *Resuelto*


### 4.2. `KBreport.md` incompleto

- **Origen técnico:** Proceso manual y no sistematizado para actualizar la KB.
- **Origen en el proceso:** Falta de revisión final y de pautas claras.
- **Responsables técnicos:** Equipo de documentación.
- **Responsables funcionales:** Coordinadores de subgrupo.
- **Mitigación técnica:** Automatización con plantillas.
- **Mitigación en proceso:** Validación cruzada.
- **Estado:** 🟡 *En progreso*


### 4.3. Falta de firmas en `Commitment Agreement`

- **Origen técnico:** No aplicable.
- **Origen en el proceso:** Descontrol en el seguimiento de documentos clave.
- **Responsables:** Todo el equipo y especialmente los jefes de proyecto.
- **Mitigación en proceso:** Checklist obligatoria de documentación.
- **Estado:** ✅ *Resuelto*


### 4.4. Ausencia de gráficos en `timeEffortReport.md`

- **Origen técnico:** Malinterpretación de requisitos.
- **Origen en el proceso:** No se revisó antes de entregar.
- **Responsables técnicos:** Subgrupo de documentación.
- **Mitigación técnica:** Generadores automáticos de gráficas.
- **Mitigación en proceso:** Revisión cruzada obligatoria.
- **Estado:** ✅ *Resuelto*


### 4.5. Formulario sin validación

- **Origen técnico:** Lógica de validación incompleta en frontend.
- **Origen en el proceso:** Fallo en pruebas funcionales previas a entrega.
- **Responsables técnicos:** Equipo frontend.
- **Responsables funcionales:** Equipo de QA y líderes técnicos.
- **Mitigación técnica:** Pruebas unitarias y funcionales obligatorias.
- **Mitigación en proceso:** QA como fase obligatoria.
- **Estado:** ✅ *Resuelto*


## 5. Conclusiones y Lecciones Aprendidas

Los errores evidencian carencias tanto técnicas como organizativas:

- ❌ **Falta de planificación y seguimiento de issues**: Muchas issues fueron desarrolladas tarde y otras no se cerraron cuando fue debido.
- ❌ **Carga de trabajo mal distribuida**: Algunos miembros asumieron un peso excesivo, mientras que otros participaron poco o nada.
- ❌ **Falta de revisiones de Pull Requests**: Se hicieron merges sin revisión o sin pruebas funcionales.
- ❌ **Descoordinación entre subgrupos**: El backend y frontend avanzaban en paralelo sin sincronización, afectando la integración.
- ❌ **Poca comunicación interna**: Cambios importantes no se comunicaban correctamente y se enteraban tarde otros equipos.
- ❌ **Ausencia de testing sistemático**: No se planificaron ni ejecutaron pruebas completas antes de la entrega.
- ❌ **Gestión reactiva y no preventiva**: Muchos problemas se detectaron solo tras la revisión, no antes.
- ❌ **Documentación entregada sin control de calidad**: Varios documentos no fueron revisados antes de enviarlos.
- ❌ **Checklist inexistente o ignorada**: No hubo confirmación de requisitos antes del momento de entrega.
- ❌ **Poca participación en retrospectivas**: No se interiorizó la mejora continua como parte del ciclo ágil.

---

## 6. Acciones Inmediatas

Para las siguientes iteraciones, se implementarán los siguientes cambios estructurales:

- ✅ **Checklists obligatorias para cada entrega** (con responsables designados).
- ✅ **Revisión cruzada de documentación y código antes de entregar.**
- ✅ **Backups y validación automática en el despliegue.**
- ✅ **QA como fase integrada del flujo de desarrollo.**
- ✅ **Automatización de gráficas e informes.**
- ✅ **Asignación equitativa de tareas y seguimiento de carga real.**
- ✅ **Canal de comunicación centralizado entre subgrupos.**
- ✅ **Reuniones breves de coordinación inter-áreas.**
- ✅ **Política estricta de revisiones en los PR.**
- ✅ **Seguimiento riguroso de issues en GitHub.**

