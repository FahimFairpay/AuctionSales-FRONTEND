"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listFavorites, toggleFavorite } from "../../api/inventory";
import { useToast } from "../../components/Toast";
import type { FavoriteItem } from "../../types/api";

export function favoriteKey(stockNumber: string, source?: string) {
  return `${(source || "IAAI").toUpperCase()}:${stockNumber}`;
}

export function useFavorites({ onPhoneRequired }: { onPhoneRequired?: () => void } = {}) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: listFavorites,
    staleTime: 60_000,
  });

  const favoriteStockNumbers = useMemo(() => {
    const set = new Set<string>();
    const raw = query.data as any;
    const items: FavoriteItem[] = Array.isArray(raw)
      ? raw
      : (raw?.items ?? raw?.favorites ?? []);
    for (const item of items) {
      if (item.stockNumber) {
        set.add(favoriteKey(item.stockNumber, item.source));
      }
    }
    return set;
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: ({
      stockNumber,
      lotData,
    }: {
      stockNumber: string;
      lotData?: Partial<FavoriteItem>;
    }) => toggleFavorite(stockNumber, lotData),

    onMutate: async ({ stockNumber, lotData }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData<{ items: FavoriteItem[] }>(["favorites"]);

      queryClient.setQueryData<{ items: FavoriteItem[] }>(["favorites"], (old) => {
        const current = old?.items ?? [];
        const exists = current.some(
          (it) => favoriteKey(it.stockNumber, it.source) === favoriteKey(stockNumber, lotData?.source),
        );
        if (exists) {
          return {
            items: current.filter(
              (it) => favoriteKey(it.stockNumber, it.source) !== favoriteKey(stockNumber, lotData?.source),
            ),
          };
        } else {
          const newItem: FavoriteItem = {
            stockNumber,
            source: lotData?.source,
            title: lotData?.title || `Stock #${stockNumber}`,
            imageUrl: lotData?.imageUrl,
            vin: lotData?.vin,
            branch: lotData?.branch,
            auctionDate: lotData?.auctionDate,
            auctionAt: lotData?.auctionAt,
            currentBid: lotData?.currentBid,
            acv: lotData?.acv,
            primaryDamage: lotData?.primaryDamage,
            savedAt: new Date().toISOString(),
          };
          return { items: [newItem, ...current] };
        }
      });

      return { previous };
    },

    onError: (err: any, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorites"], context.previous);
      }
      if (err?.status === 428 || String(err?.message || "").includes("phone number")) {
        if (onPhoneRequired) {
          onPhoneRequired();
        } else {
          pushToast("Phone number required to register interest", "error");
        }
        return;
      }
      pushToast(err?.message || "Failed to update interested vehicle", "error");
    },

    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      if (data.isFavorite) {
        pushToast("Added to Interested. Admin team has been notified to assist you.", "success");
      } else {
        pushToast("Removed from Interested.", "info");
      }
    },
  });

  const isFavorite = (stockNumber: string, source?: string) =>
    favoriteStockNumbers.has(favoriteKey(stockNumber, source));

  const toggle = (stockNumber: string, lotData?: Partial<FavoriteItem>) => {
    return mutation.mutateAsync({ stockNumber, lotData });
  };

  const raw = query.data as any;
  const favList: FavoriteItem[] = Array.isArray(raw)
    ? raw
    : (raw?.items ?? raw?.favorites ?? []);

  return {
    favorites: favList,
    favoriteStockNumbers,
    isFavorite,
    toggle,
    isPending: mutation.isPending,
    isLoading: query.isLoading,
  };
}
