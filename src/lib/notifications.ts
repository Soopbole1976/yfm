import { useRef, useCallback, useEffect, useState } from 'react';
import type { BondingMarket } from '../types';

const PROB_SPIKE_THRESHOLD = 0.03;
const CLOSING_SOON_MS = 60 * 60 * 1000; // 1 hour

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function send(title: string, body: string, tag: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, { body, tag, icon: '/favicon.svg' });
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );

  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const prevMarketsRef = useRef<Map<string, BondingMarket>>(new Map());
  const alertedClosingRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const checkMarkets = useCallback((markets: BondingMarket[]) => {
    if (permission !== 'granted') return;

    const prev = prevMarketsRef.current;
    const isFirst = isFirstLoadRef.current;
    isFirstLoadRef.current = false;

    for (const market of markets) {
      const key = market.slug;
      const prevMarket = prev.get(key);

      // New market appeared (skip on first load to avoid spamming)
      if (!prevMarket && !isFirst) {
        send(
          'New bonding opportunity',
          `${market.question} — ${(market.probability * 100).toFixed(1)}% with ${formatTime(market.timeRemaining)} left`,
          `new-${key}`,
        );
      }

      // Probability jumped significantly
      if (prevMarket && market.probability - prevMarket.probability >= PROB_SPIKE_THRESHOLD) {
        send(
          'Probability spike',
          `${market.question}: ${(prevMarket.probability * 100).toFixed(1)}% → ${(market.probability * 100).toFixed(1)}%`,
          `prob-${key}`,
        );
      }

      // Closing within 1 hour — alert once per market
      if (market.timeRemaining <= CLOSING_SOON_MS && !alertedClosingRef.current.has(key)) {
        alertedClosingRef.current.add(key);
        if (!isFirst) {
          send(
            'Market closing soon',
            `${market.question} closes in ${formatTime(market.timeRemaining)}`,
            `closing-${key}`,
          );
        }
      }
    }

    prevMarketsRef.current = new Map(markets.map((m) => [m.slug, m]));
  }, [permission]);

  return { permission, requestPermission, checkMarkets };
}
