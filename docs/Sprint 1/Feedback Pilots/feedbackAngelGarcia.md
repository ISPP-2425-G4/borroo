<div align="center">

# BORROO

![](../../imagenes/borrooLogo.png)

##  Feedback Usuarios Piloto Asignatura  

### Sprint 1 (S1) – G4
**Repositorio:** [https://github.com/ISPP-2425-G4/](https://github.com/ISPP-2425-G4/)
**Fecha:** 10/03/2025


</div>

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
- Santiago Rosado Raya (writer)
- Julia Sánchez Márquez
- Alejandro Sevillano Barea



---

## **Cómo rellenar el documento:**
En este documento se tendrán que rellenar los campos marcados con la información que se pide.

- **Nombre del usuario piloto:** Ángel García Escudero 
- **Fecha en la que se recibió el documento (dd/mm):** 12/03/2025
- **Fecha de envío del documento (dd/mm):** 12/03/2025
- **Tiempo invertido:** 22 min (https://app.clockify.me/shared/67d20a2161753b24b9d95b13)

---

## **Funcionalidades**
Como estamos teniendo problemas con el despliegue, no hemos podido cumplir con la fecha establecida, por lo que se evaluará en este Sprint las pantallas con algunas de sus funcionalidades.

En cada funcionalidad se encuentran unas capturas de pantalla de cómo va desarrollándose el sistema para que podáis poner vuestros comentarios debajo.

### **Puesta en alquiler**
![](Pantallas/pantalla_publicacion.jpg)
_(Pantalla de puesta en alquiler de un objeto)_

A esta pantalla se accede clicando en **"Poner en alquiler"**, botón que se encuentra en la navbar.

Aquí se pide:
- Título de la publicación.
- Descripción de la publicación.
- Categoría a la que pertenece el objeto dentro de las que tenemos asignadas.
- La política de cancelación del alquiler.
- Una categoría del precio si quieres ponerlo en alquiler por horas, días, semanas o meses.
- Precio del producto, dependiendo de lo puesto en categoría del precio.
- Subir fotos del producto para que la gente pueda verlo.

**Comentarios:**
Como cliente, me gustaría tener la posibilidad de elegir cuándo hacer públicas las publicaciones, así como la opción de desactivarlas temporalmente, ya que en ciertos casos puede interesarme dejar preparado un borrador para un día en concreto por diferentes factores (ej. quiero publicar un anuncio de alquiler sobre mi bicicleta, pero no la tengo lista o se ha estropeado en uno de los alquileres anteriores; en ese caso, no quiero borrar el anuncio, sino que simplemente no aparezca como disponible). Por otro lado, en cuanto a la categoría, si tengo una publicación que no concuerda con ninguna categoría, ¿existe una sección “Otros” o no sería posible subir dicha publicación? (entiendo que con un mockup es difícil visualizar todas las opciones). En lo que respecta al contenido del formulario y los datos solicitados, considero que todos son importantes y útiles para una publicación.

---

### **Solicitud de alquiler**
![](Pantallas/pantalla_anuncio.jpg)

_(Pantalla para solicitar un alquiler)_

A esta pantalla se accede clicando en un anuncio publicado.

En esta pantalla se puede observar el anuncio de una bicicleta de montaña con todos los detalles sobre el alquiler. También nos encontramos un calendario interactivo donde poder elegir las fechas por las que queremos alquilar el objeto y solicitarlo.

**Comentarios:**
Como usuario, me gustaría conocer más detalles sobre la política de cancelación “flexible”, ya que necesitaría información más específica antes de aceptar la solicitud. Además, me interesaría saber cuál sería la cuantía total en función de los días seleccionados en el calendario. En general, la vista de alquiler me parece intuitiva y atractiva, y contiene la información necesaria para gestionar un alquiler. Sin embargo, no tengo claro si el calendario es interactivo y permite seleccionar las fechas deseadas.

---

### **Motor de búsqueda**
![](Pantallas/pantalla_home.jpg)

_(Pantalla donde realizar búsquedas dentro de los productos puestos en alquiler)_

Esta es la pantalla de inicio con todos los anuncios de objetos.

Por ahora tenemos esto en cuanto al motor de búsqueda, donde podemos buscar por:
- **Categoría:** dropdown con todas las categorías.
- **Precios:** Seleccionar un rango de precios por los que buscar los objetos en alquiler.
- **Buscar:** Busca un anuncio que coincida con lo que pongas en él.

También nos encontramos anuncios como una bicicleta de montaña o un ítem de prueba.

**Comentarios:**
Como usuario, me gustaría una mejora visual en la vista general de los anuncios, diferenciando de una manera más clara las secciones de filtrado y el listado de alquileres disponibles. En la parte del filtro de precio, incluiría números que definan de manera cuantitativa los límites y permitiría la opción de filtrar por precio mínimo, máximo o ambos. Además, en el listado de alquileres, mejoraría el estilo y la visualización de cada anuncio, asegurando que cada uno incluya su respectiva imagen para una experiencia más intuitiva y atractiva.

---

### **Registro e inicio de sesión de usuarios**
![](Pantallas/pantalla_inicio.jpg)
_(Pantalla de inicio de sesión)_  
![](Pantallas/pantalla_registro.jpg)
_(Pantalla de registro)_

A estas pantallas se accede clicando en el icono de usuario que se encuentra arriba a la derecha en la navbar.

En estas pantallas nos encontramos toda la información que tiene que aportar cada usuario de la aplicación para poder crearse una cuenta. Es importante saber la dirección de los usuarios ya que se necesita un sitio para establecer un punto de encuentro si la entrega del producto es en mano.

**Comentarios:**
Las vistas presentan los datos necesarios de manera muy completa. Sin embargo, me resulta extraño que en algunos botones o títulos todas las palabras comiencen con mayúscula y en otros no, por lo que sugeriría unificar los estilos para mantener coherencia visual. Como mejora, en caso de no recordar la contraseña, me gustaría que la aplicación ofreciera una alternativa para recuperarla o establecer una nueva de forma sencilla.

---

## **Otros comentarios**
Con el objetivo de mejorar la privacidad de vuestro grupo de trabajo, como usuario piloto y miembro de la comunidad de WhatsApp, tendría acceso a todos los canales de comunicación internos, así como a sus descripciones. Existen métodos alternativos dentro de WhatsApp para prevenir estos casos y mejorar la privacidad de cada participante, especialmente en lo referente a la visibilidad del número de teléfono. Sería recomendable implementar opciones que permitan ocultar esta información o, al menos, solicitar el consentimiento e informar a los usuarios de que su número será compartido con más personas.

---

Muchas gracias, vuestra opinión nos importa. 😉