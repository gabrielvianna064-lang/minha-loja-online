const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("."));

// ===============================
// PÁGINA INICIAL
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

        console.error("Erro Mercado Pago:", erro);

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

        if (!nome || !email || !loja) {

            return res.status(400).json({
                erro: "Preencha nome, email e loja."
            });

        }

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

        console.error("Erro cadastro:", erro);

        res.status(500).json({

            sucesso: false,
            erro: "Falha no cadastro."

        });

    }

});

// ===============================
// CONECTAR MERCADO PAGO
// ===============================

app.get("/conectar-mercadopago", (req, res) => {

    res.send(`

        <!DOCTYPE html>

        <html lang="pt-BR">

        <head>

            <meta charset="UTF-8">

            <title>Conectar Mercado Pago</title>

        </head>

        <body style="
            font-family: Arial;
            text-align: center;
            padding: 40px;
        ">

            <h1>💳 Conectar Mercado Pago</h1>

            <p>
                Clique abaixo para acessar sua conta Mercado Pago.
            </p>

            <br>

            <button onclick="
                window.location.href='https://www.mercadopago.com.br/'
            "
            style="
                padding: 15px;
                background: #009ee3;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
            ">

                💳 Abrir Mercado Pago

            </button>

            <br><br>

            <button onclick="
                window.location.href='/central do vendedor.html'
            "
            style="
                padding: 15px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
            ">

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

        faturamento: Number(faturamento.toFixed(2)),

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

    const valorVenda = Number(valor) || 0;

    vendas.push({

        cliente: cliente || "Cliente",

        produto: produto || "Produto",

        valor: valorVenda,

        data: new Date().toLocaleDateString("pt-BR")

    });

    res.json({

        sucesso: true,

        mensagem: "Venda registrada com sucesso."

    });

});

// ===============================
// LISTAR VENDAS
// ===============================

app.get("/api/vendas", (req, res) => {

    res.json(vendas);

});

// ===============================
// TESTE DO TOKEN
// ===============================

app.get("/api/status", (req, res) => {

    res.json({

        servidor: "online",

        mercado_pago: process.env.MP_ACCESS_TOKEN
            ? "Access Token configurado"
            : "Access Token NÃO configurado"

    });

});

// ===============================
// SERVIDOR
// ===============================

app.listen(3000, () => {

    console.log(`
========================================
        LOJA ONLINE + MERCADO PAGO
========================================

Servidor aberto em:

http://localhost:3000

Status:

http://localhost:3000/api/status

========================================
`);

});
