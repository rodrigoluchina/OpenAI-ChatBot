import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

//3 pontos de carregamento enquanto a Engine pensa
let loadInterval;

function loader(element) {
  element.textContent = '';
  
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

//Função de digitar a resposta letra por letra
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    //Se ainda estiver escrevendo , pega a proxima letra com "chatAt" no text
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}


//Gerar ID unico para cada mensagem e com tempo e data atuais
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//Listras do chat
  //Primeiro parametro = checar se é IA ou User 
  //Segundo parametro = pegar o conteudo
  //Terceiro parametro = Gerar Id Unico

function chatStripe (isAi, value, uniqueId) {
  return (
    //Necessário ser Template Strings por poder usar espaços e outras coisas
    //"ai " classe especial se for "Ai"
    ` 
      <div class="wrapper ${isAi && 'ai'}"> 
        <div class="chat">
          <div class="profile">
            <img 
              src=${isAi ? bot : user}
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

//Usuario input para gerar a resposta da IA

const handleSubmit = async (e) => {
  //Previnir a atualização do browser padrão
  e.preventDefault();

  //Pegar os dados no formulário
  const data = new FormData(form)

  //Gerar a listra do user
  //Argumento "false" é para informar que não é a IA e sim o user
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  //limpar o formulário
  form.reset();

  //Listra do Bot 
  const uniqueId = generateUniqueId();
    //Argumento é "true" para informar que é a IA
    //Segundo parametro vazio pois vai ser preenchdo enquanto estiver carregando a mensagem
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

//Fetch data do server => resposta do bot

const response = await fetch('http://localhost:5000', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: data.get('prompt')
  })
})


//Limpar o intervalo de espera para estar apto a escrever a mensagem sem os pontos de espera  do intervalo
  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

if(response.ok) {
  const data = await response.json();
  const parsedData = data.bot.trim();

  typeText(messageDiv, parsedData);
} else {
  const err = await response.text();

  messageDiv.innerHTML = "Algo deu errado";

  alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
//user input atráves do enter (numero 13)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})
