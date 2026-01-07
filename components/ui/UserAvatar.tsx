import React, { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    playerName: string;
    className?: string;
}

export function UserAvatar({ playerName, className }: UserAvatarProps) {
    const avatarIndex = useMemo(() => {
        if (!playerName) return 1;
        let hash = 0;
        for (let i = 0; i < playerName.length; i++) {
            hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Use mod 9 + 1 to get 1-9
        return (Math.abs(hash) % 9) + 1;
    }, [playerName]);

    return (
        <div className={cn("relative rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800", className)}>
            <Image 
                src={`/cat-profile-pictures/cat${avatarIndex}.jpg`} 
                alt={playerName || "Player"} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
            />
        </div>
    );
}
