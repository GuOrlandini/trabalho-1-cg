import React, { useState, useRef, useEffect } from 'react';
import TriangleList from './List';

const TriangleCanvas = () => {
  const canvasRef = useRef(null);
  const [vertices, setVertices] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [vertexColors, setVertexColors] = useState(['#000000', '#000000', '#000000']);
  const [edgeColor, setEdgeColor] = useState('#000000');

  const drawTriangle = (ctx, triangle) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (triangle.vertices.length === 3) {
      ctx.beginPath();
      ctx.moveTo(triangle.vertices[0].x, triangle.vertices[0].y);
      ctx.lineTo(triangle.vertices[1].x, triangle.vertices[1].y);
      ctx.lineTo(triangle.vertices[2].x, triangle.vertices[2].y);
      ctx.closePath();

      ctx.lineWidth = 2;
      ctx.strokeStyle = triangle.edgeColor;
      ctx.stroke();
    }
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    drawTriangle(ctx, { vertices, edgeColor });

    const newTriangle = { vertices: [...vertices], edgeColor };
    setTriangles([...triangles, newTriangle]);
    setVertices([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawTriangle(ctx, { vertices, edgeColor });
  }, [vertices, edgeColor]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (vertices.length < 3) {
      setVertices([...vertices, { x, y, color: vertexColors[vertices.length] }]);
    }
  };

  const handleVertexColorChange = (index, color) => {
    const newVertexColors = [...vertexColors];
    newVertexColors[index] = color;
    setVertexColors(newVertexColors);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', marginBottom: '10px'}}>

          <label htmlFor="edgeColorInput"> Cor da Aresta: </label>
          <input
            type="color"
            id="edgeColorInput"
            value={edgeColor}
            onChange={(e) => setEdgeColor(e.target.value)}
          />

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {vertexColors.map((color, index) => (
          <div key={index}>
            <label htmlFor={`vertexColorInput${index + 1}`}>{`Cor do Vértice ${index + 1}:  `}</label>
            <input
              type="color"
              id={`vertexColorInput${index + 1}`}
              value={color}
              onChange={(e) => handleVertexColorChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      
      <button onClick={handleReset}>
          Apagar triângulo
      </button>

      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onClick={handleCanvasClick}
          style={{ border: '1px solid black' }}
        />
      </div>
      <TriangleList triangles={triangles} />
    </div>
  );
};

export default TriangleCanvas;