// Transport réseau : Supabase Realtime (en ligne) ou BroadcastChannel (local).
// Aucune table à créer : on utilise seulement les canaux "broadcast".
// Le présentateur fait autorité : il garde l'état et le renvoie à tout le monde.
import { CONFIG } from "./config.js";

export const isOnline = () => !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

let client = null;
async function getClient() {
  if (client) return client;
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm");
  client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 20 } },
  });
  return client;
}

export async function connect(code, onMessage, onStatus = () => {}) {
  const name = "cac-" + code;
  if (!isOnline()) {
    const bc = new BroadcastChannel(name);
    bc.onmessage = (e) => onMessage(e.data);
    onStatus("local");
    return { send: (m) => bc.postMessage(m), close: () => bc.close() };
  }
  const sb = await getClient();
  const ch = sb.channel(name, { config: { broadcast: { self: false, ack: false } } });
  ch.on("broadcast", { event: "m" }, ({ payload }) => onMessage(payload));
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Délai dépassé")), 12000);
    ch.subscribe((st) => {
      onStatus(st === "SUBSCRIBED" ? "online" : st === "CLOSED" ? "offline" : "error");
      if (st === "SUBSCRIBED") { clearTimeout(t); resolve(); }
      else if (st === "CHANNEL_ERROR" || st === "TIMED_OUT") { clearTimeout(t); reject(new Error(st)); }
    });
  });
  return {
    send: (m) => ch.send({ type: "broadcast", event: "m", payload: m }),
    close: () => sb.removeChannel(ch),
  };
}
