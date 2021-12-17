const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const app = express();
const port = 3010;

const stripe = new Stripe("sk_test_p3ptDrtq4RpKC7ZxhFMVf9pA");

app.use(cors({ origin: "https://driveinlive.us" }));
app.use(express.json());

app.post("/api/checkout", async (req, res) => {
  const { id, amount } = req.body;

  const payment = await stripe.charges.create({
    amount: 25000,
    currency: "usd",
    source: id,
    description: "My First Test Charge (created for API docs)",
  });

  res.send({ payment: payment });
});

app.post("/api/oauth", async (req, res) => {
  try {
    const { code } = req.body;
    console.log("code____:", code);

    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: code,
    });

    console.log(response);

    res.send({ connected_account_id: response });
  } catch (error) {
    res.status(400).send({ error });
  }
});

app.get("/api/products", async (req, res) => {
  const products = await stripe.products.list({
    limit: 10,
  });
  const prices = await stripe.prices.list({
    limit: 3,
  });
  console.log(prices);
  res.send({ prices, products });
});

app.post("/api/create-customer", async (req, res) => {
  const { id, email } = req.body;

  const customer = await stripe.customers.create({
    payment_method: id,
    email: email,
  });

  const paymentMethod = await stripe.paymentMethods.attach(id, {
    customer: customer.id,
  });

  // const card = await stripe.customers.createSource(customer.id, {
  //  source: paymentMethod,
  //});

  res.send({ customer: customer, paymentMethod });
});

app.get("/api/get-customers", async (req, res) => {
  const customers = await stripe.customers.list({
    limit: 100,
  });
  res.send({ customers: customers });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
