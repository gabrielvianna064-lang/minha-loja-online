require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();


app.use(cors());
app.use(express.json());


// Abrir arquivos da loja
app.use(express.static(__dirname));


// Abrir loja.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "loja.html"));
});


// Mercado Pago
const client = new MercadoPagoConfig({

    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN

});



// Criar pagamento
app.post("/criar-pagamento", async (req, res) => {

    try {

        const { nome, preco } = req.body;


        const preference = new Preference(client);


        const pagamento = await preference.create({

            body: {

                items: [

                    {

                        title: nome,

                        quantity: 1,

                        unit_price: Number(preco)

                    }

                ],


                back_urls: {

                    success: "http://localhost:3000/sucesso index.html",

                    failure: "http://localhost:3000/erro.html",

                    pending: "http://localhost:3000/pendente.html"

                }

            }

        });



        res.json({

            link: pagamento.init_point

        });



    } catch (erro) {


        console.log("Erro Mercado Pago:");

        console.log(erro);



        res.status(500).json({

            erro: "Erro ao criar pagamento"

        });


    }

});




// Teste
app.get("/teste", (req,res)=>{

    res.send("Servidor funcionando!");

});





app.listen(3000, () => {

    console.log("----------------------------");
    console.log("Servidor da loja iniciado!");
    console.log("http://localhost:3000");
    console.log("----------------------------");

});
