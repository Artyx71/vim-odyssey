import { useMemo } from 'react';

function Particles() {
    const particles = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 8}s`,
            duration: `${6 + Math.random() * 8}s`,
            size: `${2 + Math.random() * 3}px`,
        }));
    }, []);

    return (
        <div className="particles">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                    }}
                />
            ))}
        </div>
    );
}

export default Particles;
