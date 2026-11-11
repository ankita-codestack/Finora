
const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseURL = process.env.PAYPAL_BASE_URL;

  if (!clientId || !clientSecret || !baseURL) {
    throw new Error(
      "PayPal credentials are missing in environment variables."
    );
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal Authentication Error:", data);
    throw new Error(
      data.error_description || "PayPal authentication failed."
    );
  }

  return data.access_token;
};

// Create PayPal Order
const createPayPalOrder = async (invoice) => {
  const accessToken = await getPayPalAccessToken();
  const baseURL = process.env.PAYPAL_BASE_URL;

  const frontendURL = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

  const response = await fetch(`${baseURL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Finora",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: `${frontendURL}/`,
            cancel_url: `${frontendURL}/`,
          },
        },
      },
      purchase_units: [
        {
          reference_id: invoice._id.toString(),
          custom_id: invoice._id.toString(),
          description: invoice.title,
          amount: {
            currency_code: invoice.currency,
            value: Number(invoice.total).toFixed(2),
          },
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal Order Error:", data);
    throw new Error(
      data.details?.[0]?.description ||
        data.message ||
        "Unable to create PayPal order."
    );
  }

  return data;
};

// Capture PayPal Payment
const capturePayPalOrder = async (orderId) => {
  const accessToken = await getPayPalAccessToken();
  const baseURL = process.env.PAYPAL_BASE_URL;

  const orderResponse = await fetch(
    `${baseURL}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const orderData = await orderResponse.json();

  if (!orderResponse.ok) {
    console.error("PayPal Order Fetch Error:", orderData);
    throw new Error(
      orderData.message || "Unable to fetch PayPal order."
    );
  }

  if (orderData.status === "COMPLETED") {
    return orderData;
  }

  if (orderData.status !== "APPROVED") {
    throw new Error(
      `PayPal order is not approved. Current status: ${orderData.status}`
    );
  }

  const response = await fetch(
    `${baseURL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal Capture Error:", data);
    throw new Error(
      data.details?.[0]?.description ||
        data.message ||
        "Unable to capture PayPal payment."
    );
  }

  return data;
};

module.exports = {
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder,
};
