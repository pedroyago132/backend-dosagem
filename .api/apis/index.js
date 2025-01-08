const express = require('express');
const pagarme = require('pagarme');
const buffer = require('buffer');
const cors = require('cors'); // Importar o CORS
const apiKey = 'sk_test_7fdc9c80292541db910c7a1b9abcec2c'; // Substitua pela sua API Key

const app = express();
const PORT = 4000;

// Middleware para ler JSON no corpo da requisição
app.use(express.json());

app.use(cors());

// Rota para gerar o card_hash
app.post('/generate-card-hash', async (req, res) => {
  const { card_number, card_holder_name, card_expiration_date, card_cvv } = req.body;

  if (!card_number || !card_holder_name || !card_expiration_date || !card_cvv) {
    return res.status(400).json({ error: 'Todos os campos do cartão são obrigatórios' });
  }

  try {
    // Conectando ao Pagar.me com a sua chave de criptografia
    const client = await pagarme.client.connect({ encryption_key: `sk_test_7fdc9c80292541db910c7a1b9abcec2c` });

    // Gerando o card_hash
    const card_hash = await client.security.encrypt({
      card_number,
      card_holder_name,
      card_expiration_date,
      card_cvv,
    });

    // Retornando o card_hash gerado
    res.json({ card_hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar o card_hash', details: error.message });
  }
});

app.post('/create-payment', async (req, res) => {
    try {
      // Conectando ao cliente do Pagar.me
      const client = await pagarme.client.connect({ api_key: 'sk_test_7fdc9c80292541db910c7a1b9abcec2c' });
  
      // Dados do link de pagamento (você pode receber parte do payload via `req.body`)
      const paymentLinkData = {
        amount: 21000,
        items: [
          {
            id: "r123",
            title: "Assinatura 1 mês",
            unit_price: 10000,
            quantity: 1,
            tangible: true
          },
        ],
        payment_config: {
          boleto: {
            enabled: true,
            expires_in: 20
          },
          credit_card: {
            enabled: true,
            free_installments: 4,
            interest_rate: 25,
            max_installments: 12
          },
          default_payment_method: "boleto"
        },
        postback_config: {
          orders: "https://backoffice-farmatical.vercel.app/payment",
          transactions: "https://backoffice-farmatical.vercel.app/payment"
        },
        customer_config: {
          customer: {
            external_id: "#123456789",
            name: "Fulano",
            type: "individual",
            country: "br",
            email: "fulano@email.com",
            documents: [
              {
                type: "cpf",
                number: "71404665560"
              }
            ],
            phone_numbers: [
              "+5511999998888",
              "+5511888889999"
            ],
            birthday: "1985-01-01"
          },
          billing: {
            name: "Ciclano de Tal",
            address: {
              country: "br",
              state: "SP",
              city: "São Paulo",
              neighborhood: "Fulanos bairro",
              street: "Rua dos fulanos",
              street_number: "123",
              zipcode: "05170060"
            }
          },
          shipping: {
            name: "Ciclano de Tal",
            fee: 12345,
            delivery_date: "2017-12-25",
            expedited: true,
            address: {
              country: "br",
              state: "SP",
              city: "São Paulo",
              neighborhood: "Fulanos bairro",
              street: "Rua dos fulanos",
              street_number: "123",
              zipcode: "05170060"
            }
          }
        },
        max_orders: 1,
        expires_in: 60
      };
  
      // Criando o link de pagamento
      const paymentLink = await client.paymentLinks.create(paymentLinkData);
  
      // Retornando o link de pagamento
      res.status(200).json(paymentLink);
    } catch (error) {
      console.error('Erro ao criar o link de pagamento:', error);
      res.status(500).json({ error: 'Erro ao criar o link de pagamento', details: error.message });
    }
  });

  app.get('/list-links', async (req, res) => {
    try {
      // Conectando ao cliente do Pagar.me
      const client = await pagarme.client.connect({ api_key: 'sk_test_7fdc9c80292541db910c7a1b9abcec2c' });
  
      // Listando os links de pagamento
      const paymentLinks = await client.paymentLinks.all();
  
      // Retornando os links
      res.status(200).json(paymentLinks);
    } catch (error) {
      console.error('Erro ao listar os links de pagamento:', error);
      res.status(500).json({ error: 'Erro ao listar os links de pagamento', details: error.message });
    }
  });

  app.get("/payment-link-status/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const client = await pagarme.client.connect({ api_key: 'sk_test_7fdc9c80292541db910c7a1b9abcec2c' });
      const paymentLink = await client.paymentLinks.find({ id });
  
      res.status(200).json(paymentLink);
    } catch (error) {
      console.error("Erro ao buscar o link de pagamento:", error);
      res.status(500).json({ error: "Erro ao buscar o link de pagamento." });
    }
  });
// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
