import React, { useRef, useState, useEffect } from "react";
import { Page } from "react-pdf";

function LazyPage({ pageNumber, scale, onPageClick, points = [], calibration }) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef();

  // Lazy loading using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" } // preload pages a bit before they enter viewport
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Convert normalized points to pixel positions
  const pixelPoints = points
    .filter(p => p.pageNumber === pageNumber)
    .map(p => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: p.x * rect.width,
        y: p.y * rect.height
      };
    });

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: 20 }}>
      {visible && (
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onClick={(e) => onPageClick(e, pageNumber)}
        />
      )}

      {/* Calibration line overlay */}
      {pixelPoints.length === 2 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none"
          }}
        >
          <line
            x1={pixelPoints[0].x}
            y1={pixelPoints[0].y}
            x2={pixelPoints[1].x}
            y2={pixelPoints[1].y}
            stroke="red"
            strokeWidth="2"
          />
          {calibration && (
            <text
              x={(pixelPoints[0].x + pixelPoints[1].x) / 2}
              y={(pixelPoints[0].y + pixelPoints[1].y) / 2 - 5}
              fill="red"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {calibration.realDistanceMeters} m
            </text>
          )}
        </svg>
      )}
    </div>
  );
}

export default LazyPage;
