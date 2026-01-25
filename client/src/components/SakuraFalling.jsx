// src/components/SakuraFalling.jsx
import { useEffect, useState } from "react";

const SakuraFalling = () => {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    // Tạo ít cánh hoa ban đầu hơn (giảm một nửa)
    const initialPetals = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 7,
      animationDelay: Math.random() * 5,
      size: 15 + Math.random() * 15, // Kích thước nhỏ đi một nửa: 15-30px
    }));
    setPetals(initialPetals);

    // Tạo mới ít hơn (khoảng 600ms thay vì 400ms)
    const interval = setInterval(() => {
      setPetals((prev) => [
        ...prev.slice(-30), // Giữ tối đa 30 cánh (giảm một nửa)
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          animationDuration: 8 + Math.random() * 7,
          animationDelay: 0,
          size: 15 + Math.random() * 15, // Nhỏ hơn một nửa
        },
      ]);
    }, 600); // Tăng khoảng thời gian để ít hoa hơn

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 60 }} // Giữ nguyên để hoa rơi trên header nếu bạn muốn
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-fall"
          style={{
            left: `${petal.left}%`,
            top: "-100px",
            fontSize: `${petal.size}px`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.animationDelay}s`,
          }}
        >
          <span
            className="inline-block"
            style={{
              opacity: 0.85,
              filter: "brightness(1.2) saturate(1.4)",
              textShadow: "0 0 4px rgba(255, 182, 193, 0.6)",
            }}
          >
            🌸
          </span>
        </div>
      ))}

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) rotate(120deg) translateX(15px);
          }
          50% {
            transform: translateY(50vh) rotate(240deg) translateX(-10px);
          }
          75% {
            transform: translateY(75vh) rotate(360deg) translateX(20px);
          }
          100% {
            transform: translateY(120vh) rotate(480deg) translateX(0);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SakuraFalling;
