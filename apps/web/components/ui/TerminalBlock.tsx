// ═══════════════════════════════════════════════
// MIRAGE MARKET — Terminal Block
// Styled code/terminal output display
// ═══════════════════════════════════════════════

import type { ReactNode } from 'react'

interface TerminalBlockProps {
    lines: string[]
    title?: string
    className?: string
}

export function TerminalBlock({ lines, title, className = '' }: TerminalBlockProps): ReactNode {
    return (
        <div className={`terminal-block ${className}`}>
            {title && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-mirage-border">
                    <span className="w-2 h-2 bg-mirage-text-dimmer" />
                    <span className="font-mono text-[10px] tracking-wider uppercase text-mirage-text-dimmer">
                        {title}
                    </span>
                </div>
            )}
            {lines.map((line, i) => (
                <div key={i} className="flex gap-3">
                    <span className="font-mono text-[10px] text-mirage-text-dimmer select-none w-4 text-right shrink-0">
                        {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs text-mirage-text-dim">{line}</span>
                </div>
            ))}
        </div>
    )
}

// ✓ TerminalBlock.tsx complete
