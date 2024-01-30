import React from 'react';

const TriangleList = ({ triangles }) => {
  return (
    <div>
      <h2>Lista de Triângulos</h2>
      <ul>
        {triangles.map((triangle, index) => (
          <li key={index}>
            Triângulo {index + 1}: {JSON.stringify(triangle.vertices)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TriangleList;