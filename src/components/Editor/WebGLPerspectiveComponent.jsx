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

// ...createShader, createProgram는 그대로...

// 4x4 행렬 곱 함수
function multiplyMatrices(a, b) {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row + k * 4] * b[k + col * 4];
      }
      out[row + col * 4] = sum;
    }
  }
  return out;
}


// 4개 점으로 원근 투영 변환 행렬 계산
// 입력: 화면 기준 좌표 4개 (x,y), 출력: WebGL용 4x4 변환 행렬
function getPerspectiveTransformMatrix(src, dst) {
  
  // 8x8 행렬 A, 8x1 벡터 b 구성 (Ax = b 형태)
  const A = [];
  const b = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]);
    b.push(dx);

    A.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]);
    b.push(dy);
  }

  // A: 8x8, b: 8x1, x: 8x1 (h0~h7)
  // x = A^-1 * b 계산

  // 행렬 A 역행렬 구하는 함수 (간단한 가우스 조던)
  function invertMatrix(m) {
    const size = m.length;
    const I = [];
    for (let i = 0; i < size; i++) {
      I[i] = new Array(size).fill(0);
      I[i][i] = 1;
    }

    // 복사
    const M = m.map(row => row.slice());

    for (let i = 0; i < size; i++) {
      // 피벗 찾기
      let maxRow = i;
      for (let k = i + 1; k < size; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
          maxRow = k;
        }
      }
      if (maxRow !== i) {
        [M[i], M[maxRow]] = [M[maxRow], M[i]];
        [I[i], I[maxRow]] = [I[maxRow], I[i]];
      }

      // 0인 경우 역행렬 없음
      if (Math.abs(M[i][i]) < 1e-12) {
        throw new Error('Matrix is singular and cannot be inverted.');
      }

      // 피벗 1로 만들기
      const pivot = M[i][i];
      for (let j = 0; j < size; j++) {
        M[i][j] /= pivot;
        I[i][j] /= pivot;
      }

      // 나머지 행 0 만들기
      for (let k = 0; k < size; k++) {
        if (k === i) continue;
        const factor = M[k][i];
        for (let j = 0; j < size; j++) {
          M[k][j] -= factor * M[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }

    return I;
  }

  // 벡터 곱셈 함수
  function multiplyMatrixVector(m, v) {
    const res = new Array(m.length).fill(0);
    for (let i = 0; i < m.length; i++) {
      for (let j = 0; j < v.length; j++) {
        res[i] += m[i][j] * v[j];
      }
    }
    return res;
  }

  const invA = invertMatrix(A);
  const h = multiplyMatrixVector(invA, b); // h0~h7

  // h8 = 1 고정
  h.push(1);

  // 3x3 행렬
  // [ h0 h1 h2 ]
  // [ h3 h4 h5 ]
  // [ h6 h7 h8 ]
  //
  // WebGL 4x4 행렬로 변환 (z축은 identity)
  return new Float32Array([
    h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
    0,    0,    1, 0,
    h[2], h[5], 0, h[8],
  ]);
}



function WebGLPerspectiveComponent({ width, height, vertices, imageUrl }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const textureRef = useRef(null);

  // 4개 점을 clip space 좌표(-1~1)로 변환
  const getClipSpacePoints = (verts) => {
  if (!verts || verts.length !== 4) {
    throw new Error('verts 배열이 4개 요소를 포함하지 않습니다.');
  }
  return verts.map(({ x, y }) => ({
    x: (x / width) * 2 - 1,
    y: 1 - (y / height) * 2,
  }));
};

// 단순 스케일 행렬 (4x4)
function getScaleMatrix(s) {
  return new Float32Array([
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

  const renderScene = () => {
    if (!vertices || vertices.length !== 4) {
  console.warn('vertices가 4개가 아닙니다:', vertices);
  return;
}
    const gl = glRef.current;
    if (!gl || !textureRef.current || !vertices) return;

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const program = gl.program;
    if (!program) return;

    gl.useProgram(program);

    // 기본 정사각형 좌표 (clip space, -1~1)
    const positions = new Float32Array([
      -1, -1, 0, 1,
      1, -1, 0, 1,
      1, 1, 0, 1,

      1, 1, 0, 1,
      -1, 1, 0, 1,
      -1, -1, 0, 1,
    ]);
    const texCoords = new Float32Array([
      0, 1,  // ← 왼쪽 아래
      1, 1,  // ← 오른쪽 아래
      1, 0,  // ← 오른쪽 위

      1, 0,
      0, 0,
      0, 1,
    ]);


    // position buffer
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);

    // texCoord buffer
    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    // 투영 행렬 계산
    // 원본 사각형 (clip space 정사각형 좌표)
    const src = [
      { x: -1, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 },
    ];
    // 변형시킬 좌표 (clip space)
    const dst = getClipSpacePoints(vertices);

    const perspectiveMatrix = getPerspectiveTransformMatrix(src, dst);

    const scale = 1; // 1보다 크면 더 멀어짐, 1보다 작으면 더 가까워짐 (0.8 정도 시도해보세요)
    const scaleMatrix = getScaleMatrix(scale);

    const matrix = multiplyMatrices(perspectiveMatrix, scaleMatrix);
    

    const matrixLoc = gl.getUniformLocation(program, 'u_matrix');
    gl.uniformMatrix4fv(matrixLoc, false, matrix);

    // 텍스처 바인딩
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

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

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
      console.error('Failed to create shader');
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    if (!program) {
      console.error('Failed to create program');
      return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }


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
