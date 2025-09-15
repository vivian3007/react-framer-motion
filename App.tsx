import React, {useState, useRef} from "react";
import { motion } from "framer-motion";

interface Point {
    x: number;
    y: number;
}

interface Block {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

type Cell = string | "none";
type Cells = Cell[][];

interface DragState {
    id: string;
    initialPoint: Point;
    nextPoint: Point;
    valid: boolean;
}

// const gridCells = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

const range = (n: number) => {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
        result.push(i);
    }
    return result;
};

export default function App() {
    const gridRef = useRef<HTMLElement>(null);

    const initialBlocks: Block[] = [
        { id: "1", x: 0, y: 0, width: 2, height: 1, color: "#FF6B6B" },
        { id: "2", x: 2, y: 0, width: 1, height: 2, color: "#4ECDC4" },
        { id: "3", x: 0, y: 2, width: 1, height: 1, color: "#45B7D1" },
    ];

    const [blocks, setBlocks] = useState(initialBlocks);
    const [cells, setCells] = useState<Cells>(() => {
        let cells = range(10).map(y => range(10).map(x => "none" as Cell));
        initialBlocks.forEach(block => {
            for (let y = 0; y < block.height; y++) {
                for (let x = 0; x < block.width; x++) {
                    cells[y + block.y][x + block.x] = block.id;
                }
            }
        });
        return cells;
    });

    const [dragging, setDragging] = useState<DragState | undefined>();

    const CELL_SIZE = 60;

    //to get the correct position on the grid
    const pixelToGrid = (pixelX: number, pixelY: number): Point => {
        return {
            x: Math.round(pixelX / CELL_SIZE),
            y: Math.round(pixelY / CELL_SIZE)
        };
    };

    const gridToPixel = (gridX: number, gridY: number): Point => {
        return {
            x: gridX * CELL_SIZE,
            y: gridY * CELL_SIZE
        };
    };

    const clearBlockFromCells = (block: Block, currentCells: Cells): Cells => {
        const newCells = currentCells.map(row => [...row]);

        for (let y = 0; y < block.height; y++) {
            for (let x = 0; x < block.width; x++) {
                if (newCells[y + block.y] && newCells[y + block.y][x + block.x] !== undefined) {
                    newCells[y + block.y][x + block.x] = "none";
                }
            }
        }
        return newCells;
    };

    const setBlockToCells = (block: Block, currentCells: Cells): Cells => {
        const newCells = currentCells.map(row => [...row]);

        for (let y = 0; y < block.height; y++) {
            for (let x = 0; x < block.width; x++) {
                if (newCells[y + block.y] && newCells[y + block.y][x + block.x] !== undefined) {
                    newCells[y + block.y][x + block.x] = block.id;
                }
            }
        }
        return newCells;
    };

    const blockWillFit = (block: Block, point: Point, currentCells: Cells): boolean => {
        if (point.x < 0 || point.y < 0) return false;
        if (point.x + block.width > 10 || point.y + block.height > 10) return false;

        for (let y = 0; y < block.height; y++) {
            for (let x = 0; x < block.width; x++) {
                const cell = currentCells[y + point.y][x + point.x];
                if (cell !== "none" && cell !== block.id) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleDragStart = (block: Block) => {
        setDragging({
            id: block.id,
            initialPoint: { x: block.x, y: block.y },
            nextPoint: { x: block.x, y: block.y },
            valid: true,
        });
    };

    const handleDrag = (block: Block, info: any) => {
        if (!dragging) return;

        const currentPixel = gridToPixel(block.x, block.y);
        const newPixelX = currentPixel.x + info.offset.x;
        const newPixelY = currentPixel.y + info.offset.y;

        const gridPoint = pixelToGrid(newPixelX, newPixelY);
        const valid = blockWillFit(block, gridPoint, cells);

        setDragging({
            ...dragging,
            nextPoint: gridPoint,
            valid: valid
        });
    };

    const handleDragEnd = (block: Block, info: any) => {
        if (!dragging) return;

        const { valid, initialPoint, nextPoint } = dragging;
        const finalPoint = valid ? nextPoint : initialPoint;

        const clearedCells = clearBlockFromCells(block, cells);
        const updatedBlock = { ...block, x: finalPoint.x, y: finalPoint.y };
        const newCells = setBlockToCells(updatedBlock, clearedCells);

        const newBlocks = blocks.map(i =>
            i.id === block.id ? updatedBlock : i
        );

        setBlocks(newBlocks);
        setCells(newCells);

        setTimeout(() => {
            setDragging(undefined);
        }, 300);
    };

    const getCellColor = (cell: Cell, x: number, y: number) => {
        if (cell === "none") return "#f8f9fa";

        const block = blocks.find(i => i.id === cell);
        if (!block) return "#f8f9fa";

        const isTopLeft = block.x === x && block.y === y;

        return isTopLeft ? block.color : `${block.color}80`; //only top left cell is dark. The rest is transparent
    };

    const isDragValid = dragging?.valid ?? true;

    return (
        <div
            ref={gridRef}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(10, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(10, ${CELL_SIZE}px)`,
                gap: "1px",
                padding: "1px",
                position: "relative"
            }}
        >
            {cells.flat().map((cell, index) => {
                const x = index % 10;
                const y = Math.floor(index / 10);

                return (
                <div
                    key={index}
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: getCellColor(cell, x, y),
                        border: "2px solid black",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "black",
                    }}
                >
                    {index + 1}
                </div>
            )})}
            {blocks.map((block : Block) => {
                const isDragging = dragging?.id === block.id;
                const position = gridToPixel(block.x, block.y);
                return (
                <motion.div
                    key={block.id}
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDragStart={() => handleDragStart(block)}
                    onDrag={(e, info) => handleDrag(block, info)}
                    onDragEnd={(e, info) => handleDragEnd(block, info)}
                    animate={{
                        x: position.x,
                        y: position.y,
                        zIndex: isDragging ? 10 : 1
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        duration: 0.3
                    }}
                    whileDrag={{
                        scale: 1.05,
                        rotate: 1,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                    }}
                    layout
                    style={{
                        position: "absolute",
                        width: block.width * CELL_SIZE,
                        height: block.height * CELL_SIZE,
                        backgroundColor: isDragging
                            ? (isDragValid ? block.color : "#dc3545")
                            : block.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "grab",
                        opacity: isDragging && !isDragValid ? 0.7 : 1
                    }}
                >
                    {block.id}
                </motion.div>
            )})}
        </div>

    );
}
