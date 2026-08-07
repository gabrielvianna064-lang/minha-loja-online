```js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
    MercadoPagoConfig,
    Preference
} = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("."));

// ===============================
// PÁGINA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/loja.html");
});

// ===============================
// MERCADO PAGO
// ===============================

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// ===============================
// CRIAR PAGAMENTO
// ===============================

app.post("/criar-pagamento", async (req, res) => {

    try {

        const { produto, preco } = req.body;

        const valor = Number(preco);

        if (!valor || valor <= 0) {
            return res.status(400).json({
                erro: "Preço inválido."
            });
        }

        const preference = new Preference(client);

        const pagamento = await preference.create({

            body: {

                items: [
                    {
                        title: produto || "Produto da Loja",
                        quantity: 1,
                        unit_price: valor
                    }
                ],

                back_urls: {
                    success: "http://localhost:3000/sucesso.html",
                    failure: "http://localhost:3000/erro.html",
                    pending: "http://localhost:3000/sucesso.html"
                }

            }

        });

        res.json({
            sucesso: true,
            link: pagamento.init_point
        });

    } catch (erro) {

        console.log("Erro Mercado Pago:", erro);

        res.status(500).json({
            sucesso: false,
            erro: "Erro ao criar pagamento."
        });

    }

});

// ===============================
// CADASTRO DE VENDEDOR
// ===============================

app.post("/cadastrar-vendedor", async (req, res) => {

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

            sucesso: true,

            mensagem: "Cadastro enviado com sucesso."

        });

    } catch (erro) {

        console.log("Erro cadastro:", erro);

        res.status(500).json({

            sucesso: false,

            erro: "Falha no cadastro."

        });

    }

});

// ===============================
// CONECTAR MERCADO PAGO VENDEDOR
// ===============================

app.get("/conectar-mercadopago", (req, res) => {

    res.send(`

        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>Conectar Mercado Pago</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    background: #0f172a;
                    color: white;
                    text-align: center;
                    padding: 50px;
                }

                button {
                    padding: 15px 25px;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 10px;
                }

                .mp {
                    background: #009ee3;
                    color: white;
                }

                .voltar {
                    background: #28a745;
                    color: white;
                }

            </style>

        </head>

        <body>

            <h1>💳 Conectar Mercado Pago</h1>

            <p>
                Conecte sua conta Mercado Pago para receber
                os valores das suas vendas.
            </p>

            <button
                class="mp"
                onclick="window.location.href='https://www.mercadopago.com.br/'">

                💳 Abrir Mercado Pago

            </button>

            <br>

            <button
                class="voltar"
                onclick="window.location.href='/central%20do%20vendedor.html'">

                🔙 Voltar para Central do Vendedor

            </button>

        </body>

        </html>

    `);

});

// ===============================
// PAINEL DO VENDEDOR
// ===============================

const vendas = [];

app.get("/api/painel", (req, res) => {

    const faturamento = vendas.reduce(
        (total, venda) => total + venda.valor,
        0
    );

    res.json({

        downloads: vendas.length,

        faturamento: Number(
            faturamento.toFixed(2)
        ),

        aplicativos: 0,

        avaliacao: 0

    });

});

// ===============================
// REGISTRAR VENDA
// ===============================

app.post("/api/vendas", (req, res) => {

    const {
        cliente,
        produto,
        valor
    } = req.body;

    const venda = {

        cliente: cliente || "Cliente",

        produto: produto || "Produto",

        valor: Number(valor) || 0,

        data: new Date().toLocaleDateString("pt-BR")

    };

    vendas.push(venda);

    res.json({

        sucesso: true,

        mensagem: "Venda registrada com sucesso.",

        venda: venda

    });

});

// ===============================
// LISTAR VENDAS
// ===============================

app.get("/api/vendas", (req, res) => {

    res.json(vendas);

});

// ===============================
// TESTE DO SERVIDOR
// ===============================

app.get("/api/status", (req, res) => {

    res.json({

        servidor: "online",

        mercadoPago: !!process.env.MP_ACCESS_TOKEN

    });

});

// ===============================
// INICIAR SERVIDOR
// ===============================

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {

    console.log("");
    console.log("======================================");
    console.log("      LOJA ONLINE + MERCADO PAGO");
    console.log("======================================");
    console.log("");
    console.log(
        `Servidor aberto em http://localhost:${PORTA}`
    );
    console.log("");
    console.log(
        "Mercado Pago:",
        process.env.MP_ACCESS_TOKEN
            ? "TOKEN CONFIGURADO"
            : "TOKEN NÃO CONFIGURADO"
    );
    console.log("");

});
```
