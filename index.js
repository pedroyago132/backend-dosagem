const express = require('express');
const pagarme = require('pagarme');
const cors = require('cors');

// Middleware para configurar o Express
const app = express();
app.use(express.json());
app.use(cors());


// Rota para gerar o card_hash
app.post('/api/generate-card-hash', async (req, res) => {
  const { card_number, card_holder_name, card_expiration_date, card_cvv } = req.body;

  if (!card_number || !card_holder_name || !card_expiration_date || !card_cvv) {
    return res.status(400).json({ error: 'Todos os campos do cartão são obrigatórios' });
  }

  try {
    const client = await pagarme.client.connect({ encryption_key: 'sk_test_7fdc9c80292541db910c7a1b9abcec2c' });

    const card_hash = await client.security.encrypt({
      card_number,
      card_holder_name,
      card_expiration_date,
      card_cvv,
    });

    res.json({ card_hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar o card_hash', details: error.message });
  }
});

// Rota para criar um pagamento
app.post('/api/create-payment', async (req, res) => {
  try {
    const client = await pagarme.client.connect({ api_key: 'sk_test_7fdc9c80292541db910c7a1b9abcec2c' });

    const paymentLinkData = {
      amount: 21000,
      items: [
        {
          id: "r123",
          title: "Assinatura 1 mês",
          unit_price: 10000,
          quantity: 1,
          tangible: true,
        },
      ],
      payment_config: {
        boleto: { enabled: true, expires_in: 20 },
        credit_card: {
          enabled: true,
          free_installments: 4,
          interest_rate: 25,
          max_installments: 12,
        },
        default_payment_method: "boleto",
      },
      customer_config: {
        customer: {
          external_id: "#123456789",
          name: "Fulano",
          type: "individual",
          country: "br",
          email: "fulano@email.com",
          documents: [{ type: "cpf", number: "71404665560" }],
          phone_numbers: ["+5511999998888"],
          birthday: "1985-01-01",
        },
      },
      max_orders: 1,
      expires_in: 60,
    };

    const paymentLink = await client.paymentLinks.create(paymentLinkData);

    res.status(200).json(paymentLink);
  } catch (error) {
    console.error('Erro ao criar o link de pagamento:', error);
    res.status(500).json({ error: 'Erro ao criar o link de pagamento', details: error.message });
  }
});

// Rota para listar links de pagamento
app.get('/api/list-links', async (req, res) => {
  try {
    const client = await pagarme.client.connect({ api_key: 'sk_test_7fdc9c80292541db910c7a1b9abcec2c' });
    const paymentLinks = await client.paymentLinks.all();

    res.status(200).json(paymentLinks);
  } catch (error) {
    console.error('Erro ao listar os links de pagamento:', error);
    res.status(500).json({ error: 'Erro ao listar os links de pagamento', details: error.message });
  }
});

// Rota para verificar o status de um link de pagamento
app.get('/api/payment-link-status/:id', async (req, res) => {
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

module.exports = app;
