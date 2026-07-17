import React, { useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface SwipeableItemProps {
  id: string;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({ id, onDelete, children }) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const controls = useAnimation();

  // Handle drag end
  const handleDragEnd = async (_event: any, info: any) => {
    // If dragged sufficiently to the left, lock into swiped state
    if (info.offset.x < -60) {
      await controls.start({ x: -80, transition: { type: 'spring', stiffness: 300, damping: 30 } });
      setIsSwiped(true);
    } else {
      // snap back
      await controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
      setIsSwiped(false);
    }
  };

  const handleReset = async () => {
    await controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
    setIsSwiped(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 shadow-xs">
      {/* Background Action Layer */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-5 rounded-2xl">
        <button
          onClick={() => {
            onDelete(id);
            handleReset();
          }}
          className="flex flex-col items-center justify-center text-white h-full px-4 active:scale-95 transition-transform"
          title="Eliminar"
        >
          <Trash2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wider uppercase font-display">Eliminar</span>
        </button>
      </div>

      {/* Foreground Swipeable Layer */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={{ left: 0.2, right: 0.05 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative bg-white border border-gray-100 rounded-2xl cursor-grab active:cursor-grabbing"
        style={{ x: 0 }}
      >
        {children}
        
        {/* Visual tip/indicator when swiped slightly */}
        {isSwiped && (
          <div 
            onClick={handleReset}
            className="absolute inset-0 bg-black/5 rounded-2xl flex items-center justify-start pl-4 cursor-pointer"
            title="Toca para cancelar"
          >
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm font-sans font-medium">
              Atrás
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
