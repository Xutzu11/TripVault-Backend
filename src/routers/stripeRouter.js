const { loadConfig } = require('../../utils/configPathResolve.js');
const config = loadConfig('stripe.json');
const stripe = require("stripe")(config.PRIVATE_KEY);
const web_config = loadConfig('web.json');

module.exports = (app) => {
  // Create Stripe Checkout Session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    const { amount } = req.body; // amount in cents
    const baseUrl = `https://${web_config.HOST}:${web_config.PORT}`;
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Event Tickets",
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      console.error("Stripe error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify Payment Success by Session ID
  app.get("/api/stripe/verify-session/:sessionId", async (req, res) => {
    const { sessionId } = req.params;

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        res.status(200).json({ paid: true });
      } else {
        res.status(200).json({ paid: false });
      }
    } catch (error) {
      console.error("Stripe session verify error:", error.message);
      res.status(500).json({ error: "Failed to verify session" });
    }
  });
};
