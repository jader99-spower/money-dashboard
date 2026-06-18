"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { MOCK_DATA, MOCK_EXPENSES, type AssetData, type Expense } from "@/lib/mockData";

type AssetContextValue = {
  data: AssetData;
  updateAssetData: (d: AssetData) => void;
  expenses: Expense[];
  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
};

const AssetContext = createContext<AssetContextValue | null>(null);

export function AssetProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AssetData>(MOCK_DATA);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);

  const updateAssetData = useCallback((d: AssetData) => setData(d), []);

  const addExpense = useCallback((e: Omit<Expense, "id">) => {
    setExpenses((prev) => [...prev, { ...e, id: String(Date.now()) }]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <AssetContext.Provider value={{ data, updateAssetData, expenses, addExpense, deleteExpense }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssetContext(): AssetContextValue {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssetContext는 AssetProvider 내부에서만 사용 가능합니다.");
  return ctx;
}
