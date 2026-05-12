import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "~/data/products";

export type CartLine = {
  handle: string;
  title: string;
  vendor: string;
  unitPrice: number;
  image?: { url: string; alt: string };
  quantity: number;
  // Shopify variant GID. Required for checkout handoff. Static catalog
  // entries don't have one, so checkout is disabled in fallback mode.
  variantId?: string;
};

type CartState = {
  lines: CartLine[];
};

type CartAction =
  | { type: "add"; product: Product; quantity: number }
  | { type: "remove"; handle: string }
  | { type: "setQty"; handle: string; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; state: CartState };

const STORAGE_KEY = "tally-tails:cart:v1";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.lines.find((l) => l.handle === action.product.handle);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.handle === existing.handle
              ? { ...l, quantity: l.quantity + action.quantity }
              : l
          ),
        };
      }
      return {
        lines: [
          ...state.lines,
          {
            handle: action.product.handle,
            title: action.product.title,
            vendor: action.product.vendor,
            unitPrice: Number(action.product.price.amount),
            image: action.product.images[0],
            quantity: action.quantity,
            variantId: action.product.variantId,
          },
        ],
      };
    }
    case "remove":
      return { lines: state.lines.filter((l) => l.handle !== action.handle) };
    case "setQty":
      if (action.quantity <= 0) {
        return { lines: state.lines.filter((l) => l.handle !== action.handle) };
      }
      return {
        lines: state.lines.map((l) =>
          l.handle === action.handle ? { ...l, quantity: action.quantity } : l
        ),
      };
    case "clear":
      return { lines: [] };
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (handle: string) => void;
  setQuantity: (handle: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [isOpen, setOpen] = useState(false);

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        if (parsed && Array.isArray(parsed.lines)) {
          dispatch({ type: "hydrate", state: parsed });
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // persist on change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota / private mode, not fatal
    }
  }, [state]);

  // close drawer on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // lock body scroll when open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      dispatch({ type: "add", product, quantity });
      setOpen(true);
    },
    []
  );

  const removeItem = useCallback(
    (handle: string) => dispatch({ type: "remove", handle }),
    []
  );

  const setQuantity = useCallback(
    (handle: string, quantity: number) =>
      dispatch({ type: "setQty", handle, quantity }),
    []
  );

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = state.lines.reduce(
      (s, l) => s + l.unitPrice * l.quantity,
      0
    );
    return {
      lines: state.lines,
      itemCount,
      subtotal,
      isOpen,
      open,
      close,
      toggle,
      addItem,
      removeItem,
      setQuantity,
      clear,
    };
  }, [state, isOpen, open, close, toggle, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
