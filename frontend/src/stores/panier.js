import { defineStore } from "pinia";

const LS_KEY = "panier";

function loadRaw() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}

function normalize(raw) {
  // Ancien format: tableau d'items
  if (Array.isArray(raw)) {
    return {
      items: raw,
      status: "CART",       // CART | PENDING | ORDERED
      validatedAt: null,
      commandeIri: null,
      sentAt: null,
    };
  }

  // Nouveau format: objet
  if (raw && typeof raw === "object") {
    return {
      items: Array.isArray(raw.items) ? raw.items : [],
      status: raw.status || "CART",
      validatedAt: raw.validatedAt || null,
      commandeIri: raw.commandeIri || null,
      sentAt: raw.sentAt || null,
    };
  }

  // Rien en storage
  return {
    items: [],
    status: "CART",
    validatedAt: null,
    commandeIri: null,
    sentAt: null,
  };
}

function save(state) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      items: state.items,
      status: state.status,
      validatedAt: state.validatedAt,
      commandeIri: state.commandeIri,
      sentAt: state.sentAt,
    })
  );
}

export const usePanierStore = defineStore("panier", {
  state: () => normalize(loadRaw()),

  getters: {
    total: (s) =>
      (s.items ?? []).reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
        0
      ),

    count: (s) =>
      (s.items ?? []).reduce((sum, i) => sum + Number(i.qty || 0), 0),

    isPending: (s) => s.status === "PENDING",
    isOrdered: (s) => s.status === "ORDERED",

    // ✅ simple : modifiable tant que pas ORDERED
    canEdit: (s) => s.status !== "ORDERED",
  },
  

  actions: {
    persist() {
      save(this);
    },

    // ✅ on la garde pour ne rien casser (ton composable l'appelle peut-être)
    syncCutoff() {
      // (plus tard)
    },

    markSent(commandeIri) {
      if (this.commandeIri) return; // déjà envoyé
      this.commandeIri = commandeIri || null;
      this.sentAt = new Date().toISOString();
      this.persist();
    },

    add({ productIri, name, price }) {
      if (!this.canEdit) return;

      const existing = this.items.find((i) => i.productIri === productIri);
      if (existing) existing.qty += 1;
      else this.items.push({ productIri, name, price: Number(price || 0), qty: 1 });

      this.persist();
    },

    setQty(productIri, qty) {
      if (!this.canEdit) return;

      const n = Math.max(1, Math.floor(Number(qty)));
      if (!Number.isFinite(n)) return;

      const existing = this.items.find((i) => i.productIri === productIri);
      if (!existing) return;

      existing.qty = n;
      this.persist();
    },

    remove(productIri) {
      if (!this.canEdit) return;

      this.items = this.items.filter((i) => i.productIri !== productIri);
      this.persist();
    },

    clear() {
      this.items = [];
      this.status = "CART";
      this.validatedAt = null;
      this.commandeIri = null;
      this.sentAt = null;
      this.persist();
    },

    // ✅ “validation classique” = on passe en ORDERED direct
    validateClassic() {
      if (this.items.length === 0) return;

      this.status = "ORDERED";
      this.validatedAt = new Date().toISOString();
      this.persist();
    },

    // optionnel : revenir à CART si tu veux “annuler”
    unvalidateClassic() {
      if (this.status !== "ORDERED") return;
      this.status = "CART";
      this.validatedAt = null;
      this.commandeIri = null;
      this.sentAt = null;
      this.persist();
    },
  },
});
