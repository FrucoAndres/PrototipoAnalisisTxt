// Event listener para el botón de enviar
document.getElementById("message-form").addEventListener("submit", function(event) {
    event.preventDefault();

    var form = event.target;
    var userInput = form.elements["input_text"].value;

    fetch('http://127.0.0.1:8000/analizarSentimiento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'input_text=' + encodeURIComponent(userInput)
    })
    .then(response => response.json())
    .then(data => {
        sendMessage(data.clasificacion_final);
        data.fragmentos.forEach(fragmento => {
            console.log(" XXXX " + fragmento + " XXXX ");
        });
        data.valores.forEach(valor => {
            console.log("(" + valor + ")");
        });
    })
    .catch(error => console.error('Error:', error));
});

// Event listener para el botón de ver las calificaciones en comentarios
document.getElementById("feelings-web-btn").addEventListener("click", function() {
    fetch('http://127.0.0.1:8000/comentariosSentimiento', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        sendAdviceMessage(data.clasificacion_final);

        data.resultados_comentarios.forEach(resultado => {
            console.log("Texto: " + resultado.texto);
            console.log("Calificación: " + resultado.calificacion);
        });
    })
    .catch(error => console.error('Error:', error));
});




// funcion para el envio de mensajes en un chat Modelo - Usuario
function sendMessage(finalData) {
    
    var userInput = document.getElementById("user-input").value;

    if (userInput.trim() === "") {
        alert("Por favor, ingresa un mensaje antes de enviar.");
        return;
    }

    var chatMessages = document.getElementById('chat-messages');

    var userMessage = document.createElement('div');
    userMessage.className = 'message user-message';

    var userAvatar = document.createElement('img');
    userAvatar.className = 'avatar';
    userAvatar.src = './logo.png'; 

    var userMessageContent = document.createElement('div');

    var userMessageText = document.createElement('span');
    userMessageText.textContent = userInput;

    var timeElement = document.createElement('span');
    timeElement.className = 'message-time';
    timeElement.textContent = getCurrentTime();

    userMessageContent.appendChild(userMessageText);

    userMessage.appendChild(userAvatar);
    userMessage.appendChild(userMessageContent);
    userMessage.appendChild(timeElement);

    chatMessages.appendChild(userMessage);
    
    document.getElementById('user-input').value = '';

    var doctorMessage = document.createElement('div');
        doctorMessage.className = 'message doctor-message';

    var doctorAvatar = document.createElement('img');
        doctorAvatar.className = 'avatar';
        doctorAvatar.src = './logo1.png';

    var doctorMessageContent = document.createElement('div');

    var doctorMessageText = document.createElement('span');
        doctorMessageText.textContent = 'El texto es ' + finalData;

    var timeElement = document.createElement('span');
        timeElement.className = 'message-time';
        timeElement.textContent = getCurrentTime();

        doctorMessageContent.appendChild(doctorMessageText);

        doctorMessage.appendChild(doctorAvatar);
        doctorMessage.appendChild(doctorMessageContent);
        doctorMessage.appendChild(timeElement);

        chatMessages.appendChild(doctorMessage);
        scrollChatToBottom();

}

//Mensaje para mostrar la aceptación de los cometarios
function sendAdviceMessage(finalData){
    var userInput = "¿Que tan buenos son los comentarios de la web?";

    var chatMessages = document.getElementById('chat-messages');

    var userMessage = document.createElement('div');
    userMessage.className = 'message user-message';

    var userAvatar = document.createElement('img');
    userAvatar.className = 'avatar';
    userAvatar.src = './logo.png'; 

    var userMessageContent = document.createElement('div');

    var userMessageText = document.createElement('span');
    userMessageText.textContent = userInput;

    var timeElement = document.createElement('span');
    timeElement.className = 'message-time';
    timeElement.textContent = getCurrentTime();

    userMessageContent.appendChild(userMessageText);

    userMessage.appendChild(userAvatar);
    userMessage.appendChild(userMessageContent);
    userMessage.appendChild(timeElement);

    chatMessages.appendChild(userMessage);
    
    document.getElementById('user-input').value = '';

    var doctorMessage = document.createElement('div');
        doctorMessage.className = 'message doctor-message';

    var doctorAvatar = document.createElement('img');
        doctorAvatar.className = 'avatar';
        doctorAvatar.src = './logo1.png';

    var doctorMessageContent = document.createElement('div');

    var doctorMessageText = document.createElement('span');
        doctorMessageText.textContent = 'Los comentarios son de tipo ' + finalData;

    var timeElement = document.createElement('span');
        timeElement.className = 'message-time';
        timeElement.textContent = getCurrentTime();

        doctorMessageContent.appendChild(doctorMessageText);

        doctorMessage.appendChild(doctorAvatar);
        doctorMessage.appendChild(doctorMessageContent);
        doctorMessage.appendChild(timeElement);

        chatMessages.appendChild(doctorMessage);
        scrollChatToBottom();

}

//funcion para tomar la hora actual al momento de llamarla
function getCurrentTime() {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();

    hour = (hour < 10 ? "0" : "") + hour;
    minute = (minute < 10 ? "0" : "") + minute;

    return hour + ":" + minute;
}

//funcion para scrollear la barra de chat hasta el fondo
function scrollChatToBottom() {
    var chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

