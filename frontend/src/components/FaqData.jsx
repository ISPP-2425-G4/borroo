const faqData = [
    {
      question: '¿Cómo puedo poner en alquiler uno de mis objetos?',
      answer: (
        <>
          Una vez te hayas registrado e iniciado sesión, ve a la sección <strong>Publicar objeto</strong> desde el menú.
          Allí podrás subir fotos, poner una descripción, fijar el precio de alquiler por día y configurar las condiciones.
       </>
      )
    },
    {
      question: '¿Qué métodos de pago puedo usar?',
      answer: (
        <ul>
          <li>Tarjeta de crédito/débito</li>
          <li>PayPal</li>
          <li>Transferencia bancaria</li>
        </ul>
      )
    },
    {
        question: '¿Puedo darme de baja de mi suscripción premium?',
        answer: (
          <>
            Aunque nos de mucha pena, si, eres libre de cancelar tu suscripción cuando desees.
            <br />
            Solo tendrás que ir al apartado de <strong>Plan de suscripción</strong> y cambiarte al plan gratuito.
          </>
        )
    },
    {
      question: '¿Qué ocurre si el objeto se daña durante el alquiler?',
      answer: (
        <>
          Te recomendamos que describas bien el estado del objeto y acuerdes con el arrendatario un depósito o condiciones claras de uso.
          Estamos trabajando para integrar sistemas de seguridad adicionales.
        </>
      )
    },
    {
      question: '¿Puedo probar la app sin pagar?',
      answer: (
        <>
          ¡Claro! Puedes usar Borroo de forma gratuita. Si quieres desbloquear funciones extra como mayor visibilidad o destacar tus objetos, puedes suscribirte a nuestro <strong>plan premium</strong>.
        </>
       )
    },
    {
      question: '¿Cómo puedo buscar un objeto para alquilar?',
      answer: (
        <>
          Ve a la página principal y usa la <strong>barra de búsqueda</strong> para encontrar lo que necesitas. Puedes filtrar por nombre o categoría.
        </>
      )
    },
  ];
  
  export default faqData;