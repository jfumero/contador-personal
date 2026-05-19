export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Método no permitido" }),
        };
    }

    try {
        const { message } = JSON.parse(event.body || "{}");

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Falta el mensaje" }),
            };
        }

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Faltan variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID",
                }),
            };
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
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Telegram rechazó el mensaje",
                    detail: data,
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                telegram: data,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Error enviando Telegram",
                detail: error.message,
            }),
        };
    }
}
