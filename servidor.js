require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  MercadoPagoConfig,
  Preference,
  Payment
} = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
// Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});
// Criar pagamento
app.post("/criar-pagamento", async (req, res) => {

    try {

        const preference = new Preference(client);

        const pagamento = await preference.create({

            body: {

                items: [
                    {
                        title: req.body.nome || "Produto da loja",
                        quantity: 1,
                        currency_id: "BRL",
                        unit_price: Number(req.body.preco) || 10
                    }
                ],

                // Comissão da Minha Loja
                marketplace_fee: Number(req.body.taxa) || 10,

                // vendedor conectado pelo OAuth
                payer: {
                    email: req.body.email
                },

                back_urls: {
                    success: "https://minha-loja-online-vz7a.onrender.com/sucesso%20index.html",

                    failure: "https://minha-loja-online-vz7a.onrender.com/pagina%20de%20pagamento.html"
                },

                auto_return: "approved"

            }

        });


        res.json({
            link: pagamento.init_point
        });


    } catch (erro) {

        console.log(erro);

        res.status(500).json({
            erro: "Erro ao criar pagamento"
        });

    }

});


// PIX
app.post("/criar-pix", async (req, res) => {

    try {

        const payment = new Payment(client);


        const resultado = await payment.create({

            body: {

                transaction_amount: Number(req.body.valor),

                description: req.body.nome || "Pedido Minha Loja",

                payment_method_id: "pix",

                payer: {

                    email: req.body.email || "teste@teste.com"

                }

            }

        });


        res.json({

            qr_code_base64:
            resultado.point_of_interaction.transaction_data.qr_code_base64,


            qr_code:
            resultado.point_of_interaction.transaction_data.qr_code

        });


    } catch (erro) {


        console.log(erro);


        res.status(500).json({

            erro:"Erro ao criar PIX"

        });

    }

});

// Cadastro de vendedor
app.get("/cadastro-vendedor", (req, res) => {
    res.sendFile(__dirname + "/central do vendedor.html");
});

// Cadastro da loja
app.get("/cadastro-loja", (req, res) => {
    res.sendFile(__dirname + "/cadrastro na loja.html");
});

// Carrinho
app.get("/carrinho", (req, res) => {
    res.sendFile(__dirname + "/Carrio.html");
});

// Página de pagamento
app.get("/pagina-pagamento", (req, res) => {
    res.sendFile(__dirname + "/pagina de pagamento.html");
});

// Produto
app.get("/produto", (req, res) => {
    res.sendFile(__dirname + "/produto.html");
});

// Seja um vendedor
app.get("/seja-vendedor", (req, res) => {
    res.sendFile(__dirname + "/seja um vendedor.html");
});

// Regras da loja
app.get("/regras", (req, res) => {
    res.sendFile(__dirname + "/regras da loja.html");
});

// Sucesso
app.get("/sucesso", (req, res) => {
    res.sendFile(__dirname + "/sucesso index.html");
});

// Página inicial
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/loja.html");
});

// Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor da loja rodando na porta " + PORT);
});