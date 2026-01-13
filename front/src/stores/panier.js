import { defineStore } from "pinia";

const LS_KEY = "panier";

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

export const usePanierStore = defineStore("panier", {
  state: () => ({
    items: load(), // [{ productIri, name, price, qty }]
  }),

  getters: {
    total: (s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
    count: (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
  },

  actions: {
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.items));
    },

    add({ productIri, name, price }) {
      const existing = this.items.find((i) => i.productIri === productIri);
      if (existing) existing.qty += 1;
      else this.items.push({ productIri, name, price, qty: 1 });
      this.persist();
    },

    remove(productIri) {
      this.items = this.items.filter((i) => i.productIri !== productIri);
      this.persist();
    },

    clear() {
      this.items = [];
      this.persist();
    },
  },
});
