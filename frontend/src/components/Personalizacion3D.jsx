import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const createTextSprite = (text, fontFamily = "sans-serif", fontSize = 24, color = "#ffffff") => {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = text ? text.split("\n") : [];
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, height / 2 + (index - (lines.length - 1) / 2) * (fontSize + 8));
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const createOverlayTexture = (
  textureUrl,
  text,
  fontFamily = "sans-serif",
  fontSize = 24,
  color = "#ffffff",
  callback,
  backgroundColor = null
) => {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const drawOverlay = (image) => {
    ctx.clearRect(0, 0, size, size);
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);
    }

    if (image) {
      ctx.drawImage(image, 0, 0, size, size);
    }

    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = text ? text.split("\n") : [];
    const lineHeight = fontSize + 10;
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        size / 2,
        size / 2 + (index - (lines.length - 1) / 2) * lineHeight
      );
    });

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.needsUpdate = true;
    callback(canvasTexture);
  };

  if (!textureUrl) {
    drawOverlay(null);
    return;
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    drawOverlay(image);
  };
  image.onerror = () => {
    drawOverlay(null);
  };
  image.src = textureUrl;
};

const Personalizacion3D = ({ modelo = "taza", colorInterior = "#ffffff", colorBase = "#ffffff", colorExterior = "#ffffff", colorAsa = "#ffffff", texture, overlayText = "", overlayTextFontFamily = "sans-serif", overlayTextFontSize = 24, overlayTextColor = "#ffffff", textInterior = "", textExterior = "", zoom = 1, autoRotate = true }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const autoRotateRef = useRef(autoRotate);
  const modelGroupRef = useRef(null);
  const isRingRef = useRef(false);

  useEffect(() => {
    // Escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    isRingRef.current = modelo === "anillo";
    scene.background = new THREE.Color(0x333333);

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = isRingRef.current ? 4 : 5;
    cameraRef.current = camera;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight, false);
    renderer.setClearColor(0xffffff, 1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.backgroundColor = "#ffffff";
    mountRef.current.appendChild(renderer.domElement);

    const resizeScene = () => {
      if (!mountRef.current) return;
      const bounds = mountRef.current.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", resizeScene);
    document.addEventListener("fullscreenchange", resizeScene);
    document.addEventListener("webkitfullscreenchange", resizeScene);
    document.addEventListener("mozfullscreenchange", resizeScene);
    document.addEventListener("MSFullscreenChange", resizeScene);

    const resizeObserver = new ResizeObserver(resizeScene);
    resizeObserver.observe(mountRef.current);

    resizeScene();

    // Luz
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 8, 7);
    scene.add(directionalLight);

    const modelGroup = new THREE.Group();
    const sprites = [];
    const addTextSprite = (text, zOffset, fontFamily = "sans-serif", fontSize = 24, color = "#ffffff") => {
      if (!text) return;
      const textTexture = createTextSprite(text, fontFamily, fontSize, color);
      const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2.4, 0.75, 1);
      sprite.position.set(0, 0, zOffset);
      modelGroup.add(sprite);
      sprites.push(sprite);
    };

    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    if (isRingRef.current) {
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorExterior || "#ffffff"),
        roughness: 0.2,
        metalness: 0.9,
        side: THREE.DoubleSide,
        emissive: 0x0d3b82,
        emissiveIntensity: 0.05,
      });

      // Single centered ring (one circunferencia)
      const radius = 0.7; // radio principal
      const tube = 0.11; // grosor del anillo
      const segmentsRadial = 32;
      const segmentsTubular = 200;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, segmentsRadial, segmentsTubular), ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0, 0);
      modelGroup.add(ring);

      addTextSprite(textInterior, -0.75, overlayTextFontFamily, overlayTextFontSize, overlayTextColor);
      addTextSprite(textExterior, 0.75, overlayTextFontFamily, overlayTextFontSize, overlayTextColor);
      addTextSprite(overlayText, 1.1, overlayTextFontFamily, overlayTextFontSize, overlayTextColor);

      const disposeSprites = () => {
        sprites.forEach((sprite) => {
          if (sprite.material.map) sprite.material.map.dispose();
          sprite.material.dispose();
          modelGroup.remove(sprite);
        });
      };

      modelGroup.userData.disposeSprites = disposeSprites;
    } else {
      // Geometría de ejemplo (pocillo con cilindro abierto, fondo y asa)
      const interiorMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorInterior || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.BackSide,
      });

      const exteriorMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorExterior || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.FrontSide,
      });

      const baseMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorBase || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
      });

      const asaMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorAsa || "#ffffff"),
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const applyExteriorTexture = () => {
        if (overlayText) {
          createOverlayTexture(
            texture,
            overlayText,
            overlayTextFontFamily,
            overlayTextFontSize,
            overlayTextColor,
            (canvasTexture) => {
              exteriorMaterial.map = canvasTexture;
              exteriorMaterial.transparent = false;
              exteriorMaterial.alphaTest = 0;
              exteriorMaterial.needsUpdate = true;
            },
            colorExterior || "#ffffff"
          );
          return;
        }

        if (texture) {
          const loader = new THREE.TextureLoader();
          loader.load(
            texture,
            (loadedTexture) => {
              loadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
              loadedTexture.needsUpdate = true;
              exteriorMaterial.map = loadedTexture;
              exteriorMaterial.needsUpdate = true;
            },
            undefined,
            (err) => {
              console.error('Error cargando textura 3D:', err);
            }
          );
        }
      };

      applyExteriorTexture();

      const cupGroup = new THREE.Group();

      const cupGeometry = new THREE.CylinderGeometry(1, 1, 2, 32, 1, true);
      const cupInterior = new THREE.Mesh(cupGeometry, interiorMaterial);
      cupInterior.position.y = 0;
      cupGroup.add(cupInterior);

      const cupExterior = new THREE.Mesh(cupGeometry, exteriorMaterial);
      cupExterior.position.y = 0;
      cupGroup.add(cupExterior);

      const bottomGeometry = new THREE.CylinderGeometry(1.02, 1.02, 0.15, 32);
      const bottomMesh = new THREE.Mesh(bottomGeometry, baseMaterial);
      bottomMesh.position.y = -1.075;
      cupGroup.add(bottomMesh);

      class HandleCurve extends THREE.Curve {
        constructor(scale = 1) {
          super();
          this.scale = scale;
        }

        getPoint(t) {
          const angle = Math.PI * (t - 0.5);
          const radius = 0.5;
          const x = 1 + Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return new THREE.Vector3(x, y, 0).multiplyScalar(this.scale);
        }
      }

      const handleCurve = new HandleCurve();
      const handleGeometry = new THREE.TubeGeometry(handleCurve, 32, 0.12, 16, false);
      const handleMesh = new THREE.Mesh(handleGeometry, asaMaterial);
      cupGroup.add(handleMesh);

      const rimGeometry = new THREE.TorusGeometry(1.02, 0.08, 16, 100, Math.PI * 2);
      const rimMesh = new THREE.Mesh(rimGeometry, asaMaterial);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 1;
      cupGroup.add(rimMesh);

      modelGroup.add(cupGroup);

      const disposeSprites = () => {
        sprites.forEach((sprite) => {
          if (sprite.material.map) sprite.material.map.dispose();
          sprite.material.dispose();
          modelGroup.remove(sprite);
        });
      };
      modelGroup.userData.disposeSprites = disposeSprites;
    }

    const isDraggingRef = { current: false };
    const previousPointerRef = { current: { x: 0, y: 0 } };

    const onPointerDown = (event) => {
      isDraggingRef.current = true;
      previousPointerRef.current = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!isDraggingRef.current) return;
      const deltaX = event.clientX - previousPointerRef.current.x;
      const deltaY = event.clientY - previousPointerRef.current.y;

      modelGroup.rotation.y += deltaX * 0.005;
      modelGroup.rotation.x = Math.max(Math.min(modelGroup.rotation.x + deltaY * 0.005, Math.PI / 2), -Math.PI / 2);
      previousPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event) => {
      isDraggingRef.current = false;
      if (event.pointerId != null) renderer.domElement.releasePointerCapture(event.pointerId);
    };

    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerUp);

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDraggingRef.current && autoRotateRef.current) {
        modelGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeScene);
      document.removeEventListener("fullscreenchange", resizeScene);
      document.removeEventListener("webkitfullscreenchange", resizeScene);
      document.removeEventListener("mozfullscreenchange", resizeScene);
      document.removeEventListener("MSFullscreenChange", resizeScene);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerUp);
      if (modelGroup.userData.disposeSprites) {
        modelGroup.userData.disposeSprites();
      }
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelo, colorInterior, colorBase, colorExterior, colorAsa, texture, textInterior, textExterior]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Manejo separado de zoom para evitar parpadeos
  useEffect(() => {
    if (!cameraRef.current) return;
    
    // Actualizar zoom de la cámara
    const baseZ = isRingRef.current ? 4 : 5;
    cameraRef.current.position.z = baseZ / zoom;
    cameraRef.current.updateProjectionMatrix();
  }, [zoom]);

  return <div className="personalizacion-3d-canvas" ref={mountRef}></div>;
};

export default Personalizacion3D;
