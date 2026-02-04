import React, { useState, useEffect } from "react";
import { Document } from "react-pdf";
import LazyPage from "./LazyPage";
import { calibrateScale } from "../core/calibration/calibrationEngine"; // adjust path

function PDFViewer({ file, scale = 1 }) {
  const [numPages, setNumPages] = useState(null);
  const [points, setPoints] = useState([]);
  const [calibration, setCalibration] = useState(null);

  // Single click handler
  function handlePageClick(event, pageNumber) {
    const rect = event.currentTarget.getBoundingClientRect();

    const point = {
      pageNumber,
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };

    // Keep only last click + new for 2-point calibration
    setPoints((prev) => [...prev.slice(-1), point]);
  }

  // Run calibration when 2 points are clicked
  useEffect(() => {
    if (points.length === 2) {
      const result = calibrateScale({
        pointA: points[0],
        pointB: points[1],
        realDistanceMeters: 5
      });

      setCalibration(result);
      console.log("Calibration ready:", result);
    }
  }, [points]);

  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
    >
      {Array.from(new Array(numPages), (_, i) => (
        <LazyPage
          key={i}
          pageNumber={i + 1}
          scale={scale}
          onPageClick={handlePageClick}
          points={points}           // pass clicked points
          calibration={calibration} // pass calibration for distance label
        />
      ))}
    </Document>
  );
}

export default PDFViewer;
