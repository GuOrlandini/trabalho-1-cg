import React, { useState, useRef, useEffect } from 'react';
import TriangleList from './List';

const TriangleCanvas = () => {
  const canvasRef = useRef(null);
  const [vertices, setVertices] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [vertexColors, setVertexColors] = useState(['#000000', '#000000', '#000000']);
  const [vertexColorsAux, setVertexColorsAux] = useState(['#000000', '#000000', '#000000']); // Função auxiliar para o melhor funcionamento da escolha das cores dos vértices
  const [edgeColor, setEdgeColor] = useState('#000000');

  // Função que desenhará o triângulo dentro do contexto do canvas
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
      fillPoly(ctx, triangle)
      ctx.stroke();
    }
  };

  // Função para preencher um polígono triangular em um contexto 2D de canvas usando o algoritmo de preenchimento de scanline.
  // A função também recebe um array chamado vertexColors, contendo valores hexadecimais de cor para cada vértice.
  const fillPoly = (ctx, triangle) => {
    if (triangle.vertices && triangle.vertices.length === 3) {        // Verificação de existência do triângulo.
      triangle.vertices.sort((a, b) => a.y - b.y);                    // Ordena os vértices para o funcionamento do scanline.

      let v0 = triangle.vertices[0], v1 = triangle.vertices[1], v2 = triangle.vertices[2]
      
      // Converte valores hexadecimais de cor para RGB para cada vértice.
      const v0color = hexToRgb(vertexColors[0])
      const v1color = hexToRgb(vertexColors[1])
      const v2color = hexToRgb(vertexColors[2])

      // console.log('cores', v0color);

      
      // Define as arestas do triângulo junto com suas taxas para interpolação de x e cor.
      const arestas = [     
        {
          begin: v0,
          end: v1,
          rate: ((v1.x - v0.x) / (v1.y - v0.y)),
          rateR: ((v1color.R - v0color.R) / (v1.y - v0.y)),
          rateG: ((v1color.G - v0color.G) / (v1.y - v0.y)),
          rateB: ((v1color.B - v0color.B) / (v1.y - v0.y))
        },
        {
          begin: v1,
          end: v2,
          rate: ((v2.x - v1.x) / (v2.y - v1.y)),
          rateR: ((v2color.R - v1color.R) / (v2.y - v1.y)),
          rateG: ((v2color.G - v1color.G) / (v2.y - v1.y)),
          rateB: ((v2color.B - v1color.B) / (v2.y - v1.y))
        },
        {
          begin: v2,
          end: v0,
          rate: ((v0.x - v2.x) / (v0.y - v2.y)),
          rateR: ((v0color.R - v2color.R) / (v0.y - v2.y)),
          rateG: ((v0color.G - v2color.G) / (v0.y - v2.y)),
          rateB: ((v0color.B - v2color.B) / (v0.y - v2.y))
        }
      ]

      let lastX = 0, lastc, inverte = false
      for (let y = v0.y, i = 0; y < v1.y; y++, i++) { // Loop para preenchimento da parte superior do triângulo.
        let interval = [
          arestas[0].begin.x + arestas[0].rate * i,
          arestas[0].begin.x + arestas[2].rate * i
        ]
        lastX = interval[1]
        // Verifica e ajusta a ordem dos intervalos se necessário.
        if (interval[1] < interval[0]) {
          const aux = interval[0]
          interval[0] = interval[1]
          interval[1] = aux
          inverte = true
        }

        interval[0] = Math.floor(interval[0])
        interval[1] = Math.floor(interval[1])

        let color0 = {
          R: v0color.R + arestas[0].rateR * i,
          G: v0color.G + arestas[0].rateG * i,
          B: v0color.B + arestas[0].rateB * i
        }
        let color2 = {
          R: v0color.R + arestas[2].rateR * i,
          G: v0color.G + arestas[2].rateG * i,
          B: v0color.B + arestas[2].rateB * i
        }
        lastc = color2

        // Troca as cores se a ordem foi ajustada.
        if (inverte) {
          const aux = color0
          color0 = color2
          color2 = aux
        }

        const varX = interval[1] - interval[0]
        const delta = {
          R: (color2.R - color0.R) / varX,
          G: (color2.G - color0.G) / varX,
          B: (color2.B - color0.B) / varX
        }

        // Loop para preencher os pixels na linha de varredura.
        for (let j = interval[0], k = 0; j < interval[1]; j++, k++) {
          ctx.fillStyle = `rgb(${color0.R + delta.R * k}, ${color0.G + delta.G * k}, ${color0.B + delta.B * k})`
          ctx.fillRect(j, y, 1, 1)
        }
      }
      
      // Reinicializa a variável inverte.
      inverte = false

      for (let y = v1.y, i = 0; y < v2.y; y++, i++) {  // Loop para preenchimento da parte inferior do triângulo.
        let interval = [arestas[1].begin.x + arestas[1].rate * i, lastX + arestas[2].rate * i]
        if (interval[1] < interval[0]) {
          const aux = interval[0]
          interval[0] = interval[1]
          interval[1] = aux
          inverte = true
        }
        interval[0] = Math.floor(interval[0])
        interval[1] = Math.floor(interval[1])

        
        let color1 = {
          R: v1color.R + arestas[1].rateR * i,
          G: v1color.G + arestas[1].rateG * i,
          B: v1color.B + arestas[1].rateB * i
        }
        let color2 = {
          R: lastc.R + arestas[2].rateR * i,
          G: lastc.G + arestas[2].rateG * i,
          B: lastc.B + arestas[2].rateB * i
        }
        if (inverte) {
          const aux = color1
          color1 = color2
          color2 = aux
        }

        const varX = interval[1] - interval[0]
        const delta = {
          R: (color2.R - color1.R) / varX,
          G: (color2.G - color1.G) / varX,
          B: (color2.B - color1.B) / varX
        }

        for (let j = interval[0], k = 0; j < interval[1]; j++, k++) {
          ctx.fillStyle = `rgb(${color1.R + delta.R * k}, ${color1.G + delta.G * k}, ${color1.B + delta.B * k})`
          ctx.fillRect(j, y, 1, 1)
        }
      }
    }
    
  };

  function hexToRgb(hex) {
    const R = parseInt(hex.substring(1, 3), 16);
    const G = parseInt(hex.substring(3, 5), 16);
    const B = parseInt(hex.substring(5, 7), 16);
    return { R, G, B };
  }

  // Função que apaga o triângulo no canvas e salva na lista
  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    drawTriangle(ctx, { vertices, edgeColor });

    const newTriangle = { vertices: [...vertices], edgeColor };
    setTriangles([...triangles, newTriangle]);
    setVertices([]);
  };

  // O hook useEffect d o react atualiza o desenho no canvas sempre que os vértices, a cor da aresta ou as cores dos vértices são modificados.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawTriangle(ctx, { vertices, edgeColor });
  }, [vertices, edgeColor, vertexColors]);
  
  // Manipula os clicks no canvas e transforma em vértices.
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
    setVertexColorsAux(newVertexColors);
  };

  const confirmChange = () => {
    setVertexColors(vertexColorsAux)
  }

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
        {vertexColorsAux.map((color, index) => (
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
      
      <button onClick={confirmChange}>
          Pintar triângulo
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