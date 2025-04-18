// src/components/Player.jsx
import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../game/store';

// This is a React wrapper for the Player entity
// Note: The actual player rendering is handled in GameCanvas
const Player = ({ spawnPoint }) => {
    const playerRef = useRef(null);
    const { setHealth } = useGameStore();

    // This component doesn't render anything visible
    // It's a logical component that connects the player entity to the React system
    useEffect(() => {
        if (playerRef.current) {
            // Initialize player position based on spawn point
            playerRef.current.position = {
                x: spawnPoint.x,
                y: spawnPoint.y
            };

            // Set up health change listener
            const handleHealthChange = (health) => {
                setHealth(health);
            };

            // Add listener to player entity
            playerRef.current.onHealthChange = handleHealthChange;

            return () => {
                // Cleanup
                if (playerRef.current) {
                    playerRef.current.onHealthChange = null;
                }
            };
        }
    }, [spawnPoint, setHealth]);

    return null; // This component doesn't render anything visible
};

export default Player;