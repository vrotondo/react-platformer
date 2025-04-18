// src/game/store.js
import { create } from 'zustand';

export const useGameStore = create((set) => ({
    // Player stats
    health: 100,
    score: 0,
    lives: 3,

    // Game state
    isPaused: false,
    isGameOver: false,
    currentLevel: 1,

    // Setters
    setHealth: (health) => set({ health }),
    setScore: (score) => set({ score }),
    setLives: (lives) => set({ lives }),
    setIsPaused: (isPaused) => set({ isPaused }),
    setIsGameOver: (isGameOver) => set({ isGameOver }),
    setCurrentLevel: (currentLevel) => set({ currentLevel }),

    // Game actions
    resetGame: () => set({
        health: 100,
        score: 0,
        lives: 3,
        isPaused: false,
        isGameOver: false,
        currentLevel: 1
    }),

    // Player died
    handlePlayerDeath: () => set((state) => {
        const newLives = state.lives - 1;

        if (newLives <= 0) {
            // Game over
            return {
                lives: 0,
                isGameOver: true
            };
        }

        // Reset player for next life
        return {
            health: 100,
            lives: newLives
        };
    }),

    // Level completed
    completeLevel: () => set((state) => ({
        currentLevel: state.currentLevel + 1,
        // Optionally give bonus health or score here
    })),

    // Add points to score
    addPoints: (points) => set((state) => ({
        score: state.score + points
    })),

    // Take damage and check if player died
    takeDamage: (damage) => set((state) => {
        const newHealth = Math.max(0, state.health - damage);

        if (newHealth <= 0) {
            // Call handlePlayerDeath on the next frame to avoid
            // state update conflicts
            setTimeout(() => {
                useGameStore.getState().handlePlayerDeath();
            }, 0);
        }

        return { health: newHealth };
    })
}));