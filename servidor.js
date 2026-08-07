const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("."));


app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/loja.html");
});


// ===============================
// MERCADO PAGO PIX
// ===============================

const client = new MercadoPagoConfig({

    accessToken: process.env.MERCADO_PAGO_TOKEN

});



// CRIAR PIX

app.post("/criar-pix", async (req,res)=>{


try {


const { produto, preco } = req.body;



const payment = new Payment(client);



const pagamento = await payment.create({

body:{


transaction_amount: Number(preco) || 50,


description: produto || "Produto da Loja",



payment_method_id:"pix",



payer:{

email:"cliente@teste.com"

}


}



});





res.json({


qr_code:
pagamento.point_of_interaction.transaction_data.qr_code,



qr_code_base64:
pagamento.point_of_interaction.transaction_data.qr_code_base64



});



}catch(erro){


console.log("Erro PIX:",erro);



res.status(500).json({

erro:"Erro ao criar PIX"

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

}=req.body;



console.log("==============================");

console.log("NOVO VENDEDOR");

console.log("Nome:",nome);

console.log("Email:",email);

console.log("Loja:",loja);

console.log("==============================");




res.json({

sucesso:true,

mensagem:"Cadastro enviado com sucesso"

});



}catch(erro){


console.log(erro);


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

">

🔙 Voltar para Central do Vendedor

</button>


`);


});





// ===============================
// PAINEL DO VENDEDOR
// ===============================


const vendas=[];



app.get("/api/painel",(req,res)=>{


const faturamento = vendas.reduce(

(total,venda)=>total+venda.valor,0

);



res.json({

downloads:vendas.length,

faturamento:faturamento,

aplicativos:0,

avaliacao:0


});


});





// ===============================
// REGISTRAR VENDA
// ===============================


app.post("/api/vendas",(req,res)=>{


const {

cliente,
produto,
valor

}=req.body;



vendas.push({

cliente:cliente || "Cliente",

produto:produto || "Produto",

valor:Number(valor)||0,

data:new Date().toLocaleDateString("pt-BR")


});



res.json({

sucesso:true,

mensagem:"Venda registrada com sucesso"

});


});






// ===============================
// LISTAR VENDAS
// ===============================


app.get("/api/vendas",(req,res)=>{


res.json(vendas);


});






// ===============================
// SERVIDOR
// ===============================


app.listen(3000,()=>{


console.log(`

================================
 LOJA ONLINE + PIX MERCADO PAGO
================================

Servidor aberto em:

http://localhost:3000


`);


});
