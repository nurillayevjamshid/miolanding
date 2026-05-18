exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, phone, message } = JSON.parse(event.body);

    // AmoCRM va Google Sheets sozlamalari
    const SUBDOMAIN = process.env.AMO_SUBDOMAIN; // masalan: 'mycompany'
    const ACCESS_TOKEN = process.env.AMO_ACCESS_TOKEN; // Long-lived token
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL; // Google Apps Script Web App URL

    if (!GOOGLE_SHEETS_URL && (!SUBDOMAIN || !ACCESS_TOKEN)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Integratsiya sozlamalari topilmadi. Google Sheets yoki AmoCRM sozlanishi kerak." }),
      };
    }

    let amoSuccess = false;
    let googleSuccess = false;
    const errors = [];

    // 1. Google Sheets Integratsiyasi
    if (GOOGLE_SHEETS_URL) {
      try {
        // Google Sheets telefondagi "+" belgisini va bo'shliqlarni matematika formulasi deb o'ylamasligi uchun
        // telefon raqami boshiga (') belgisini qo'shib matn formatiga o'tkazamiz.
        const formattedPhone = phone && phone.startsWith('+') ? `'${phone}` : phone;

        const googleResponse = await fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, phone: formattedPhone, message }),
        });
        
        if (googleResponse.ok) {
          googleSuccess = true;
        } else {
          const errText = await googleResponse.text();
          errors.push(`Google Sheets error: ${googleResponse.status} - ${errText}`);
        }
      } catch (err) {
        errors.push(`Google Sheets network error: ${err.message}`);
      }
    }

    // 2. AmoCRM Integratsiyasi
    if (SUBDOMAIN && ACCESS_TOKEN) {
      try {
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
          amoSuccess = true;
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
        } else {
          errors.push(`AmoCRM error: ${leadResponse.status} - ${JSON.stringify(leadData)}`);
        }
      } catch (err) {
        errors.push(`AmoCRM network error: ${err.message}`);
      }
    }

    // Agar kamida bitta integratsiya muvaffaqiyatli bo'lsa, OK qaytaramiz
    if (googleSuccess || amoSuccess) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          amo: amoSuccess, 
          sheets: googleSuccess,
          warnings: errors.length > 0 ? errors : undefined 
        }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          errors: errors 
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
