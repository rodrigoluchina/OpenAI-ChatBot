import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//Inicializar aplicação express

const app = express();
//Permitir que a aplicação faça CORS
//Permitir que o server seja iniciado a partir do Front-end
app.use(cors());
//Permitir que o Front-End passe JSON para Back-end
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Olá,by Codex',
    })
})

//Coletar dados re uma requisição do Front
app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        //Pegar uma reposta da OpenAPI
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt:`${prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        });
    
    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
})

//Confirmar que o server sempre receba requests
app.listen(5000, () => console.log('Server is running on port http://localhost:5000'));



