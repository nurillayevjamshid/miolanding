exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, phone, message } = JSON.parse(event.body);

    // AmoCRM ma'lumotlari (Bularni Netlify Environment Variables'ga qo'shish kerak)
    const SUBDOMAIN = process.env.AMO_SUBDOMAIN; // masalan: 'mycompany'
    const ACCESS_TOKEN = process.env.AMO_ACCESS_TOKEN; // Long-lived token

    if (!SUBDOMAIN || !ACCESS_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "AmoCRM sozlamalari topilmadi" }),
      };
    }

    // AmoCRM API orqali Lead yaratish (Complex request - Lead + Contact)
    const leadResponse = await fetch(`https://${SUBDOMAIN}.amocrm.ru/api/v4/leads/complex`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          "name": `Landingdan yangi murojaat: ${name}`,
          "_embedded": {
            "contacts": [
              {
                "first_name": name,
                "custom_fields_values": [
                  {
                    "field_code": "PHONE",
                    "values": [
                      {
                        "value": phone,
                        "enum_code": "WORK"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]),
    });

    const leadData = await leadResponse.json();

    if (leadResponse.ok) {
      // Lead muvaffaqiyatli yaratildi, endi xabarni "Note" sifatida qo'shamiz
      const leadId = leadData[0].id;
      
      await fetch(`https://${SUBDOMAIN}.amocrm.ru/api/v4/leads/${leadId}/notes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            "note_type": "common",
            "params": {
              "text": `Mijoz xabari: ${message}`
            }
          }
        ])
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
