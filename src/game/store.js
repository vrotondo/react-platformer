// src/game/store.js
import { create } from 'zustand';
export const useGameStore = create(set => ({
    health: 100,
    score: 0,
    isPaused: false,
    setHealth: (health) => set({ health }),
}));