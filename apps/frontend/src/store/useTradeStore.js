import { useContext } from "react";
import { TradeContext } from "./TradeContext";

export function useTradeStore() {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTradeStore must be used inside TradeProvider");
  }
  return context;
}
