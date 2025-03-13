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

- **Nombre del usuario piloto:** Pablo Olivencia Moreno
- **Fecha en la que se recibió el documento (dd/mm):** 12/03  
- **Fecha de envío del documento (dd/mm):** 13/03  
- **Tiempo invertido:** 28 minutos (https://app.clockify.me/shared/67d2a7ca06a063047ed8f160)

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
Quizás lo que más me llama la atención de esta pantalla es el apartado de ‘Selecciona 
una política de cancelación’ y ‘Selecciona categoría de precio’, ya que podrían no 
quedar claras para el usuario. Quizá sería útil proporcionar ejemplos breves o 
descripciones emergentes que expliquen estas opciones. 
Además, podría resultar confuso qué campos son obligatorios y cuáles no. Por 
ejemplo, 'Descripción' o la selección de imágenes podrían considerarse opcionales. 
Sería bueno indicarlo visualmente o con texto explicativo debajo de cada campo. 
Finalmente, para mejorar la experiencia de usuario y evitar errores, recomiendo que el 
botón ‘Publicar’ permanezca claramente deshabilitado hasta que se hayan 
completado correctamente todos los campos obligatorios.  

---

### **Solicitud de alquiler**
![](Pantallas/pantalla_anuncio.jpg)

_(Pantalla para solicitar un alquiler)_

A esta pantalla se accede clicando en un anuncio publicado.

En esta pantalla se puede observar el anuncio de una bicicleta de montaña con todos los detalles sobre el alquiler. También nos encontramos un calendario interactivo donde poder elegir las fechas por las que queremos alquilar el objeto y solicitarlo.

**Comentarios:**
En este apartado echo en falta un indicador claro de quién ha publicado el anuncio, 
incluyendo quizás un enlace al perfil del usuario, para poder revisar su experiencia y 
reseñas de otros usuarios, lo que mejoraría la confianza al solicitar un alquiler. 
Además, sería intuitivo mostrar visualmente al usuario cuál será el precio total según el 
rango de fechas seleccionado, facilitando así el cálculo del coste final del alquiler 
antes de confirmar la solicitud. 

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
Para mejorar la experiencia en esta pantalla, me gustaría disponer de un dropdown 
adicional que permita ordenar los resultados de diversas maneras, por ejemplo: por 
anuncios más populares, más recientes, precio ascendente o descendente, entre otras 
opciones.  
Además, creo que sería útil incluir imágenes miniatura de los productos directamente 
en las tarjetas de resultados. 

---

### **Registro e inicio de sesión de usuarios**
![](Pantallas/pantalla_inicio.jpg)
_(Pantalla de inicio de sesión)_  
![](Pantallas/pantalla_registro.jpg)
_(Pantalla de registro)_

A estas pantallas se accede clicando en el icono de usuario que se encuentra arriba a la derecha en la navbar.

En estas pantallas nos encontramos toda la información que tiene que aportar cada usuario de la aplicación para poder crearse una cuenta. Es importante saber la dirección de los usuarios ya que se necesita un sitio para establecer un punto de encuentro si la entrega del producto es en mano.

**Comentarios:**
Al igual que en la pantalla de puesta en alquiler, creo que debería mostrarse 
claramente qué campos del formulario son obligatorios y cuáles no lo son (en caso de 
haberlos), por ejemplo, mediante un asterisco o texto explicativo. Además, sería más 
intuitivo que el botón ‘Crear cuenta’ permaneciera claramente deshabilitado hasta 
que el usuario haya introducido correctamente todos los campos requeridos. 
También sería útil disponer de un botón para mostrar y ocultar las contraseñas 
introducidas, facilitando así la revisión y evitando posibles errores. 
Creo que sería relevante para este tipo de plataformas que los usuarios tuvieran que 
verificar su identificar su identidad mediante algún documento oficial, dando así más 
seguridad a las operaciones.

---

## **Otros comentarios**
Para este tipo de plataformas sería muy útil implementar un sistema de verificación de 
identidad mediante documentos oficiales (como DN). Esta verificación podría 
realizarse durante el proceso de registro o posteriormente antes de realizar alguna 
transacción. Esto ayudaría significativamente a aumentar la confianza y seguridad 
entre los usuarios al realizar operaciones dentro de la aplicación. 

---

Muchas gracias, vuestra opinión nos importa. 😉