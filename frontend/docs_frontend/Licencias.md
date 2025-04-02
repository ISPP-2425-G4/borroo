# Información de Licencias
**Última actualización:** *03/04/2025* 

## 1. Introducción
Este documento describe las herramientas utilizadas en el desarrollo de nuestro proyecto software con un enfoque en sus licencias, restricciones y posibles implicaciones legales.

## 2. Herramientas Utilizadas y sus Licencias
A continuación, se detallan las herramientas utilizadas en el proyecto, sus respectivas licencias y consideraciones relevantes.

### 2.1. Herramientas de Gestión y Colaboración

| Herramienta       | Descripción | Licencia | Restricciones / Implicaciones |
|------------------|-------------|----------|-----------------------------|
| **Clockify** | Aplicación de seguimiento de tiempo. | Plan gratuito y 6 planes de pago variados | El uso en su versión gratuita es limitado, y los datos están sujetos a sus políticas de privacidad. Esta política de privacidad viene determinada por la empresa [Cake](https://cake.com/terms).
| **Zenhub** | Extensión para gestión de proyectos en GitHub. | Modelo de suscripción | Su versión gratuita solo es accesible para proyectos públicos. Contiene limitaciones. |
| **GitHub** | Plataforma de control de versiones y repositorios. | GNU GPL (para software de código abierto), Términos propios de GitHub para repositorios privados | Uso gratuito para repositorios públicos y educativos. |
| **GitHub Actions** | Automatización de CI/CD dentro de GitHub. | Términos de uso de GitHub | Uso gratuito limitado, con costos adicionales en entornos empresariales. |
| **OneDrive** | Servicio de almacenamiento en la nube. | Licencia comercial (Microsoft) | Datos sujetos a políticas de privacidad de Microsoft. |

### 2.2. Herramientas de Desarrollo y Tecnologías

| Herramienta       | Descripción | Licencia | Restricciones / Implicaciones |
|------------------|-------------|----------|-----------------------------|
| **Google App Engine** | Plataforma de desarrollo en la nube. | Licencia propietaria de Google Cloud | Uso gratuito con límites, costos adicionales para escalabilidad. |
| **MariaDB** | Sistema de gestión de bases de datos relacional. | GPL v2 | Puede usarse libremente mientras se respete la licencia GPL. |
| **Python** | Lenguaje de programación. | PSF License (Python Software Foundation) | Uso libre, incluso en entornos comerciales. |
| **Node.js** | Entorno de ejecución para JavaScript. | MIT | Licencia permisiva, sin restricciones significativas. |
| **Django** | Framework web para Python. | BSD | Licencia permisiva, sin restricciones significativas. |
| **React** | Biblioteca para interfaces de usuario. | MIT | Uso libre, incluso en proyectos comerciales. |

## 3. Análisis de Licencias y Consideraciones

### 3.1. Licencia MIT
La licencia MIT es una de las licencias de software libre más permisivas. Permite a los usuarios usar, copiar, modificar, fusionar, distribuir y sublicenciar el software, siempre y cuando se mantenga la atribución al autor original. No impone restricciones sobre su uso en proyectos comerciales o privados.

### 3.2. Licencia BSD
Existen varias versiones de la licencia BSD, pero en general, permite la redistribución y uso con muy pocas restricciones, siempre y cuando se conserve la notificación de derechos de autor. No requiere que el software derivado también use la misma licencia, lo que la hace altamente compatible con proyectos comerciales.

### 3.3. Licencia GPL v2
La Licencia Pública General de GNU (GPL v2) es una licencia copyleft, lo que significa que cualquier software derivado también debe estar bajo la misma licencia. Esto garantiza que el código permanezca abierto, pero puede ser un problema para empresas que desean usarlo en productos privativos.

### 3.4. Licencia PSF (Python Software Foundation)
Esta licencia es similar a la BSD y MIT, ya que permite el uso, modificación y distribución del software sin restricciones significativas, siempre y cuando se mantengan los créditos al autor original.

### 3.5. Licencia GNU GPL
Similar a la GPL v2, pero en versiones más recientes (GPL v3) se han agregado restricciones adicionales para prevenir técnicas como el Tivoization (restringir el uso de software GPL en hardware específico).

## 4. Implicaciones para un Proyecto Universitario
Dado que el proyecto se encuentra en un entorno educativo, es crucial analizar cómo las licencias afectan su desarrollo y uso:

| Herramienta | Implicaciones |
|------------|--------------|
| **GitHub Actions** | Uso gratuito hasta 50,000 minutos en repositorios públicos; costos si se excede. |
| **MariaDB (GPL v2)** | Puede utilizarse libremente, pero si el software derivado se distribuye, debe mantener la misma licencia GPL. |
| **React (MIT License)** | Uso libre, incluso en entornos comerciales y educativos. |
| **Python (PSF License)** | Sin restricciones de uso en proyectos universitarios. |
| **Google App Engine** | Puede generar costos si se superan los límites gratuitos. |
| **OneDrive** | Puede implicar problemas de privacidad si se almacenan datos sensibles. |


## 5. Cláusulas Abusivas en los Términos de Uso
Al analizar los términos y condiciones de las herramientas utilizadas, se han identificado algunas cláusulas que podrían considerarse abusivas o problemáticas. Estas cláusulas se han detectado mediante la herramienta Claudette:

### 5.1. Cláusulas potencialmente abusivas de Zenhub

#### **Modificación unilateral**  
1. Los planes estarán listados en la página de precios de Zenhub y pueden cambiar en cualquier momento.

#### **Limitación de responsabilidad**  
2. Zenhub no será responsable por errores, omisiones o daños derivados del uso de materiales en el servicio.  
7. Zenhub puede terminar el acceso a su discreción sin responsabilidad alguna.  
8. Cualquier material descargado a través del servicio es bajo su propio riesgo.  
9. Zenhub no será responsable por el contenido intercambiado en el servicio.  
10. Zenhub no será responsable por ningún daño derivado del uso del servicio, errores en el sitio web, virus u otras pérdidas.  
11. Estas limitaciones aplican incluso si Zenhub ha sido advertido sobre la posibilidad de daños.  
12. La responsabilidad de Zenhub se limitará a $50 o la cantidad pagada en los últimos 12 meses.

#### **Eliminación de contenidos**  
3. Zenhub se reserva el derecho de eliminar o restringir la distribución de contenido de los usuarios.  
6. La terminación del acceso puede incluir la eliminación de materiales subidos por el usuario.

#### **Rescisión unilateral**  
4. Zenhub puede terminar el acceso al servicio sin previo aviso.  
5. Motivos de terminación incluyen incumplimientos, solicitudes gubernamentales, decisiones de Zenhub, problemas técnicos o actividades fraudulentas.  
6. La terminación del acceso puede incluir la eliminación de materiales del usuario.  
7. Zenhub puede terminar el acceso a su discreción sin responsabilidad alguna.  

### 5.2. Cláusulas potencialmente abusivas de CAKE.com

#### **Modificación unilateral**  
1. CAKE se reserva el derecho de modificar, suspender, actualizar, cambiar o descontinuar, temporal o permanentemente, los Servicios (o cualquier parte de ellos) en cualquier momento y sin previo aviso ni responsabilidad.  
2. CAKE puede, a su entera discreción, modificar los Servicios o el Software, lo que puede afectar la interoperabilidad o compatibilidad con Add-Ons y Ofertas de Terceros.  
3. Los precios establecidos en el Plan de Precios están sujetos a cambios en cualquier momento y CAKE puede modificar los precios de los Servicios a su entera discreción.  
4. De tiempo en tiempo, CAKE podrá emitir actualizaciones para los Servicios.  

#### **Rescisión unilateral**  
1. CAKE puede limitar las conexiones a la API o suspender o cancelar la Cuenta del Usuario.  
2. Si el método de pago predeterminado es rechazado, CAKE podrá, a su exclusiva discreción, denegar el acceso al Plan de Suscripción de manera inmediata.  
3. CAKE puede, sin previo aviso, terminar, suspender o desconectar los Servicios en caso de impago de los cargos durante cinco (5) días calendario después de la fecha de vencimiento.  

#### **Eliminación de contenidos**  
1. CAKE puede investigar quejas y violaciones y tomar cualquier acción a su entera discreción, incluyendo la emisión de advertencias, la suspensión o desconexión de los Servicios, la eliminación de datos o contenido, o la terminación de cuentas o perfiles de usuarios.  

#### **Contrato por el uso**  
9. Al utilizar o instalar un Add-On, el usuario acepta sus términos y condiciones y reconoce haber revisado su política de privacidad.  

#### **Limitación de responsabilidad**  
1.  CAKE no será responsable del procesamiento de pagos ni de ningún asunto relacionado con ello.  
2.  CAKE no será responsable de ningún acto u omisión de cualquier proveedor de Add-Ons o Terceros, incluyendo el acceso, modificación o eliminación de datos, independientemente de si CAKE respalda o aprueba dichos Add-Ons o Terceros.  
3.  El usuario es el único responsable de cualquier daño que pueda sufrir por el uso o la imposibilidad de uso de los Add-Ons.  
4.  CAKE no será responsable, bajo ninguna circunstancia, por cualquier dato o contenido visualizado a través de los Servicios, incluyendo errores, omisiones, pérdidas o daños derivados del uso, acceso o denegación de acceso a dichos datos o contenido.  
5.  La responsabilidad por contenido y datos es exclusiva del usuario.  