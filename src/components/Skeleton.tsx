/**
 * Skeleton loader component for loading states.
 */

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loader with different variants.
 */
const Skeleton = ({ className = '', variant = 'text', width, height }: SkeletonProps) => {
  const baseStyles = 'bg-zinc-800 animate-pulse';
  
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded',
    avatar: 'w-12 h-12 rounded-full',
    button: 'h-12 w-24 rounded',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Card skeleton for StudyMaterial loading state.
 */
export const CardSkeleton = () => (
  <div className="p-6 bg-zinc-950 border-2 border-white/20 space-y-4">
    <Skeleton variant="text" width="60%" height={24} />
    <Skeleton variant="text" />
    <Skeleton variant="text" width="80%" />
    <div className="flex gap-2">
      <Skeleton variant="button" />
      <Skeleton variant="button" />
    </div>
  </div>
);

/**
 * Topic card skeleton for Dashboard.
 */
export const TopicSkeleton = () => (
  <div className="p-4 bg-zinc-950 border-2 border-white/20">
    <Skeleton variant="text" width="40%" height={20} />
    <div className="mt-2 flex gap-2">
      <Skeleton variant="avatar" />
      <Skeleton variant="avatar" />
      <Skeleton variant="avatar" />
    </div>
  </div>
);

/**
 * Chat message skeleton.
 */
export const ChatMessageSkeleton = () => (
  <div className="flex gap-4 p-6 border-2 border-white/20 bg-zinc-950 mr-12">
    <Skeleton variant="avatar" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
);

export default Skeleton;