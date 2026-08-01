const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("."));


app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/loja.html");
});


// ===============================
// MERCADO PAGO
// ===============================

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_TOKEN
});

app.post("/criar-pagamento", async (req,res)=>{

    try {

        const { produto, preco } = req.body;

        const preference = new Preference(client);

        const pagamento = await preference.create({

            body: {

                items:[
                    {
                        title: produto || "Produto da Loja",
                        quantity: 1,
                        unit_price: Number(preco) || 50
                    }
                ],

                back_urls:{
                    success:"https://minha-loja-online-kbe8.onrender.com/sucesso.html",
                    failure:"https://minha-loja-online-kbe8.onrender.com/erro.html",
                    pending:"https://minha-loja-online-kbe8.onrender.com/sucesso.html"
                }

            }

        });

        res.json({
            link: pagamento.init_point
        });

    } catch(erro){

        console.log("Erro Mercado Pago:", erro);

        res.status(500).json({
            erro:"Erro ao criar pagamento"
        });

    }

});
// ===============================
// CADASTRO DE VENDEDOR
// ===============================

app.post("/cadastrar-vendedor", async (req,res)=>{

    try {

        const {
            nome,
            email,
            loja
        } = req.body;


        console.log("================================");
        console.log("NOVO VENDEDOR");
        console.log("Nome:", nome);
        console.log("Email:", email);
        console.log("Loja:", loja);
        console.log("================================");


        res.json({

            sucesso:true,

            mensagem:"Cadastro enviado com sucesso"

        });


    } catch(erro){

        console.log("Erro cadastro:",erro);

        res.status(500).json({

            erro:"Falha no cadastro"

        });

    }

});
// ===============================
// CONECTAR MERCADO PAGO VENDEDOR
// ===============================

app.get("/conectar-mercadopago",(req,res)=>{

    res.send(`
        <h1>💳 Conectar Mercado Pago</h1>

        <p>
        Clique abaixo para entrar ou criar sua conta Mercado Pago.
        </p>

        <br>

        <button onclick="window.location.href='https://www.mercadopago.com.br/'"
        style="
        padding:15px;
        background:#009ee3;
        color:white;
        border:none;
        border-radius:10px;
        font-size:16px;
        cursor:pointer;
        ">
        💳 Abrir Mercado Pago
        </button>

        <br><br>

        <button onclick="window.location.href='/central do vendedor.html'"
        style="
        padding:15px;
        background:#28a745;
        color:white;
        border:none;
        border-radius:10px;
        font-size:16px;
        cursor:pointer;
        ">
        🔙 Voltar para Central do Vendedor
        </button>
    `);

});


// ===============================
// SERVIDOR
// ===============================

app.listen(3000,()=>{

console.log(`
================================
 LOJA ONLINE + MERCADO PAGO
================================

Servidor aberto em:
http://localhost:3000

`);

});
