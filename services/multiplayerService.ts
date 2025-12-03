
import { useState, useEffect, useCallback, useRef } from 'react';
import { MultiplayerMessage } from '../types';

const CHANNEL_NAME = 'fintech_casino_x_lobby';

export const useMultiplayer = () => {
  const [messages, setMessages] = useState<MultiplayerMessage[]>([]);
  // Mock initial players to make the lobby feel alive immediately
  const [players, setPlayers] = useState<string[]>(['CryptoKing', 'Sarah99']);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Initialize BroadcastChannel
    const bc = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = bc;

    bc.onmessage = (event) => {
      if (event.data) {
        const data = event.data as MultiplayerMessage;
        setMessages((prev) => [...prev, data].slice(-50)); // Keep last 50 messages

        // If we see a new user chatting or winning, add them to the player list
        if (data.user && data.user !== 'YOU') {
          setPlayers((prev) => {
            if (!prev.includes(data.user)) {
              return [...prev, data.user];
            }
            return prev;
          });
        }
      }
    };

    return () => {
      bc.close();
    };
  }, []);

  const sendEvent = useCallback((event: Omit<MultiplayerMessage, 'timestamp'>) => {
    if (!channelRef.current) return;

    const msg: MultiplayerMessage = {
      ...event,
      timestamp: Date.now()
    };

    // Post to other tabs
    channelRef.current.postMessage(msg);
    
    // Update local state immediately (BroadcastChannel doesn't fire onmessage for self)
    setMessages((prev) => [...prev, msg].slice(-50));
  }, []);

  return { messages, players, sendEvent };
};
