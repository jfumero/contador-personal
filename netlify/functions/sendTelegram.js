function json(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };
}

function validarSecret(event) {
    const configuredSecret = process.env.ALERT_SECRET;

    if (!configuredSecret) {
        return {
            ok: false,
            statusCode: 500,
            message: "Falta configurar ALERT_SECRET en Netlify.",
        };
    }

    const receivedSecret =
        event.headers["x-alert-secret"] ||
        event.headers["X-Alert-Secret"] ||
        event.queryStringParameters?.secret;

    if (!receivedSecret || receivedSecret !== configuredSecret) {
        return {
            ok: false,
            statusCode: 401,
            message: "No autorizado. Falta o no coincide ALERT_SECRET.",
        };
    }

    return { ok: true };
}

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return json(405, { error: "Método no permitido" });
    }

    const auth = validarSecret(event);

    if (!auth.ok) {
        return json(auth.statusCode, { error: auth.message });
    }

    try {
        const { message } = JSON.parse(event.body || "{}");

        if (!message || typeof message !== "string") {
            return json(400, { error: "Falta el mensaje" });
        }

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return json(500, {
                error: "Faltan variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID",
            });
        }

        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return json(500, {
                error: "Telegram rechazó el mensaje",
                detail: data,
            });
        }

        return json(200, {
            ok: true,
            telegram: data,
        });
    } catch (error) {
        return json(500, {
            error: "Error enviando Telegram",
            detail: error.message,
        });
    }
}
