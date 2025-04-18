// src/components/Level.jsx
export default function Level({ levelData, children }) {
    return (
        <div className="level">
            {children /* Renders Player here */}
        </div>
    );
}