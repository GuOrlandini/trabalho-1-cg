import React from "react";
import TriangleCanvas from "./Draw.js";

function App() {
  return (
    <div>
      <h1>Trabalho 01 de Computação Gráfica</h1>
      <p>Clique 3 vezes dentro do quadro abaixo para definir os vértices do triângulo. Clique no botão "Apagar triângulo" para apagar o triângulo atual e desenhar um novo.</p>
      <TriangleCanvas />
    </div>
  );
}

export default App;