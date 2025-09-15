import React, {useState, useRef} from "react";
import { motion } from "framer-motion";

const gridCells = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

export default function App() {
    const gridRef = useRef<HTMLElement>(null);
    const [blocks, setBlocks] = useState([
        { id: 1, x: 0, y: 0, color: "#FF6B6B" },
        { id: 2, x: 0, y: 0, color: "#4ECDC4" },
    ]);

    const snapToGrid = (x: number, y: number) => {
        const col = Math.round(x / 150);
        const row = Math.round(y / 150);
        return { x: col * 150, y: row * 150 };
    };

    const handleDragEnd = (id: number, info: any) => {
        const block = blocks.find((b) => b.id === id);
        if (!block) return;

        const newX = block.x + info.offset.x;
        const newY = block.y + info.offset.y;

        const snapped = snapToGrid(newX, newY);

        setBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, x: snapped.x, y: snapped.y } : b))
        );
    };

    return (
        <div
            ref={gridRef}
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 150px)",
                gridTemplateRows: "repeat(5, 150px)",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            {gridCells.map((i) => (
                <div
                    key={i}
                    style={{
                        width: "150px",
                        height: "150px",
                        border: "2px solid black",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "black",
                    }}
                >
                    {i + 1}
                </div>
            ))}
            {blocks.map((block) => (
                <motion.div
                    key={block.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => handleDragEnd(block.id, info)}
                    animate={{ x: block.x, y: block.y }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    layout
                    style={{
                        // x: block.x,
                        // y: block.y,
                        width: 140,
                        height: 140,
                        backgroundColor: block.color,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: "bold",
                        cursor: "grab",
                    }}
                >
                    {block.id}
                </motion.div>
            ))}
        </div>

    );
}
