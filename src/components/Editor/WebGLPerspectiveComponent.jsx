import React, { useEffect, useRef } from 'react';

function WebGLPerspectiveComponent({ vertices, imageUrl, wallType, width, height }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const textureRef = useRef(null);

  //디버깅용
  useEffect(() => {
  console.log('vertices:', vertices);
  renderScene();
}, [vertices, imageUrl]);


  // 정점 셰이더 (좌표 변환, 텍스처 매핑)
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0, 1);
      v_texCoord = a_texCoord;
    }
  `;

  // 단순 텍스처 샘플링 프래그먼트 셰이더
  const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;

    void main() {
      gl_FragColor = texture2D(u_image, v_texCoord);
    }
  `;

  // 셰이더 생성 헬퍼
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // 프로그램 생성 헬퍼
  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  // 텍스처 생성 및 이미지 로딩
  useEffect(() => {
    if (!imageUrl) return;

    const gl = glRef.current;
    if (!gl) return;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 임시 1x1 흰색 텍스처 (이미지 로딩 전에)
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      1, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255])
    );

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // 텍스처 필터링 설정
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      textureRef.current = texture;
      renderScene();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // 정점 위치를 WebGL clip space 좌표(-1~1)로 변환 (캔버스 픽셀 기준 -> -1~1)
  const convertToClipSpace = (x, y) => {
    return [
      (x / width) * 2 - 1,
      -((y / height) * 2 - 1)
    ];
  };

  // 4점 꼭지점 기준으로 사각형 또는 폴리곤 정점 데이터 생성
  // vertices는 [{x,y}, ...] 4개 배열로 가정
  const getVerticesData = () => {
    if (!vertices || vertices.length !== 4) return null;

    // front는 rect니까 정사각형 2개 삼각형으로 렌더링
    // left, right, top, bottom은 polygon이니 어쩔 수 없이 4점 그대로 사용

    // 여기서는 단순히 polygon 2개 삼각형 분할하여 그릴 수 있도록 처리
    // 일단 단순 2개 삼각형(6점)으로 렌더링해보겠습니다.

    // 정점은 clip space로 변환
    const clipPoints = vertices.map(v => convertToClipSpace(v.x, v.y));

    // 텍스처 좌표 (0,0)~(1,1) 사각형 고정 (front는 왜곡 안 함)
    // 나머지 폴리곤은 좌표에 따라 적절하게 매핑해야 하지만 여기선 일단 간단히 사각형으로 둠
    // (필요하면 더 정교하게 계산 가능)
    const texCoords = [
      [0, 0], [1, 0], [1, 1], [0, 1]
    ];

    // 두 삼각형으로 나누기 (0,1,2)와 (2,3,0)
    const positions = [
      ...clipPoints[0], ...clipPoints[1], ...clipPoints[2],
      ...clipPoints[2], ...clipPoints[3], ...clipPoints[0]
    ];

    const texCoordinates = [
      ...texCoords[0], ...texCoords[1], ...texCoords[2],
      ...texCoords[2], ...texCoords[3], ...texCoords[0]
    ];

    return { positions, texCoordinates };
  };

  // WebGL 초기화 및 렌더링
  const renderScene = () => {
    const gl = glRef.current;
    if (!gl || !textureRef.current || !vertices) return;

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0); // 투명 배경
    gl.clear(gl.COLOR_BUFFER_BIT);

    const program = gl.program;
    if (!program) return;

    gl.useProgram(program);

    const posData = getVerticesData();
    if (!posData) return;

    // 버퍼 생성 및 데이터 바인딩
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData.positions), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData.texCoordinates), gl.STATIC_DRAW);

    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    // 텍스처 활성화
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureRef.current);

    const samplerLoc = gl.getUniformLocation(program, 'u_image');
    gl.uniform1i(samplerLoc, 0);

    // 그리기
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // cleanup
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

    // 셰이더 생성 및 프로그램 연결
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.program = program;

    // 렌더링 준비
    renderScene();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // vertices 또는 imageUrl 바뀌면 다시 렌더
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
