import React, { useRef, useEffect } from 'react';

const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec2 a_texCoord;

  uniform mat4 u_matrix;

  varying vec2 v_texCoord;

  void main() {
    gl_Position = u_matrix * a_position;
    v_texCoord = a_texCoord;
  }
  `;

const fragmentShaderSource = `
  precision mediump float;

  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
  `;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function WebGLPerspectiveComponent({ width, height, vertices, imageUrl }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const textureRef = useRef(null);

  const convertToClipSpace = (x, y) => {
    return [(x / width) * 2 - 1, -((y / height) * 2 - 1)];
  };

  // 기존 함수 대신 교체
const getVerticesData = () => {
  if (!vertices || vertices.length !== 4) return null;

  const z = 0;

  const positions = [];
  for (const v of vertices) {
    positions.push(v.x, v.y, z, 1);
  }

  const finalPositions = [
    ...positions.slice(0, 4),
    ...positions.slice(4, 8),
    ...positions.slice(8, 12),
    ...positions.slice(8, 12),
    ...positions.slice(12, 16),
    ...positions.slice(0, 4),
  ];

  const texCoords = [
    0, 0, 1, 0, 1, 1,
    1, 1, 0, 1, 0, 0,
  ];

  return { positions: finalPositions, texCoordinates: texCoords };
};

  const computeOrthoMatrix = () => {
  const left = 0;
  const right = width;
  const bottom = height;
  const top = 0;
  const near = -1;
  const far = 1;

  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);

  return new Float32Array([
    -2 * lr, 0, 0, 0,
    0, -2 * bt, 0, 0,
    0, 0, 2 * nf, 0,
    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1,
  ]);
};




  const renderScene = () => {
    const gl = glRef.current;
    if (!gl || !textureRef.current || !vertices) return;

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const program = gl.program;
    if (!program) return;

    gl.useProgram(program);

    const posData = getVerticesData();
    if (!posData) return;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData.positions), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData.texCoordinates), gl.STATIC_DRAW);

    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

    const matrix = computeOrthoMatrix();
    const matrixLoc = gl.getUniformLocation(program, 'u_matrix');
    gl.uniformMatrix4fv(matrixLoc, false, matrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.deleteBuffer(posBuffer);
    gl.deleteBuffer(texBuffer);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.program = program;

    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = '';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      textureRef.current = texture;
      renderScene();
    };
    image.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    renderScene();
  }, [vertices, imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, display: vertices ? 'block' : 'none' }}
    />
  );
}

export default WebGLPerspectiveComponent;