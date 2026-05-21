import { supabase } from "./supabase";

const CLOUD_ID = "contador_personal";

const KEYS = [
    "contador_personal_obligaciones",
"contador_personal_iva_pagos",
"contador_personal_anep_facturas",
"contador_personal_fonasa_config",
"contador_personal_bps_pagos",
];

let timeoutId = null;
let sincronizando = false;
let iniciado = false;

function leerEstadoLocal() {
    const data = {};

    KEYS.forEach((key) => {
        const value = localStorage.getItem(key);

        if (value !== null) {
            try {
                data[key] = JSON.parse(value);
            } catch {
                data[key] = value;
            }
        }
    });

    return data;
}

function aplicarEstadoLocal(data) {
    Object.entries(data || {}).forEach(([key, value]) => {
        if (!KEYS.includes(key)) return;

        localStorage.setItem(key, JSON.stringify(value));
    });
}

export async function guardarEstadoCloud() {
    if (sincronizando) return;

    const data = leerEstadoLocal();

    const { error } = await supabase
    .from("app_state")
    .update({
        data,
        updated_at: new Date().toISOString(),
    })
    .eq("id", CLOUD_ID);

    if (error) {
        console.error("Error guardando en Supabase:", error);
        return;
    }

    console.log("Estado guardado en Supabase");
}

export function guardarEstadoCloudDebounced() {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
        guardarEstadoCloud();
    }, 800);
}

export async function cargarEstadoCloud() {
    sincronizando = true;

    const { data, error } = await supabase
    .from("app_state")
    .select("data")
    .eq("id", CLOUD_ID)
    .single();

    if (error) {
        console.error("Error cargando Supabase:", error);
        sincronizando = false;
        return;
    }

    const cloudData = data?.data || {};
    const localData = leerEstadoLocal();

    const cloudVacio = Object.keys(cloudData).length === 0;
    const localTieneDatos = Object.keys(localData).length > 0;

    if (cloudVacio && localTieneDatos) {
        sincronizando = false;
        await guardarEstadoCloud();
        return;
    }

    aplicarEstadoLocal(cloudData);

    sincronizando = false;
}

export function iniciarSincronizacionCloud() {
    if (iniciado) return;

    iniciado = true;

    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = function (key, value) {
        originalSetItem(key, value);

        if (KEYS.includes(key)) {
            guardarEstadoCloudDebounced();
        }
    };

    localStorage.removeItem = function (key) {
        originalRemoveItem(key);

        if (KEYS.includes(key)) {
            guardarEstadoCloudDebounced();
        }
    };
}
