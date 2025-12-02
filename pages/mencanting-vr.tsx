import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Volume2, VolumeX, RotateCcw, Undo, ChevronLeft, ChevronRight, Book, History, Sparkles, Target, Clock, Droplets, Award } from 'lucide-react';

// --- Komponen Model Canting ---
const CantingModel = ({ position, rotation, isDrawing, inkLeft }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load file GLB
  const { scene } = useGLTF('/model/canting_batik_xl.glb'); 
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive 
        object={scene.clone()} 
        scale={0.015} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
      />
      
      {/* Efek warning jika tinta habis */}
      {inkLeft <= 0 && (
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Preload model canting
useGLTF.preload('/model/canting_batik_xl.glb');

// --- Komponen Kompor dan Wajan Batik ---
const BatikEquipment = ({ onRefillInk, inkLeft }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Load model equipment
  const { scene } = useGLTF('/model/batik_equipment.glb');
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (inkLeft < 100) {
      onRefillInk();
      
      // Efek visual saat mengisi ulang
      if (groupRef.current) {
        groupRef.current.scale.set(1.05, 1.05, 1.05);
        setTimeout(() => {
          if (groupRef.current) {
            groupRef.current.scale.set(1, 1, 1);
          }
        }, 200);
      }
    }
  };

  const handlePointerEnter = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
  };

  return (
    <group 
      ref={groupRef}
      position={[1.5, 0.3, -0.5]}
      rotation={[0, Math.PI / 6, 0]}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <primitive 
        object={scene.clone()} 
        scale={0.018}
      />
      
      {/* Highlight effect ketika hover */}
      {isHovered && inkLeft < 100 && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Text instruksi */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color={isHovered && inkLeft < 100 ? "#00FF00" : "#FFFFFF"}
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {inkLeft < 100 ? "Klik untuk isi tinta" : "Tinta Penuh"}
      </Text>
      
      {/* Efek asap ketika tinta habis */}
      {inkLeft <= 0 && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#888888" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Preload model equipment
useGLTF.preload('/model/batik_equipment.glb');

// --- Komponen Kain Batik dengan History & Undo ---
const BatikCloth = forwardRef(({ patternUrl, isDrawing, onDraw, inkLeft, level, patternOpacity }: any, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const textureRef = useRef<THREE.CanvasTexture>(null);
  const patternImageRef = useRef<HTMLImageElement | null>(null);
  
  const [cursorPos, setCursorPos] = useState<THREE.Vector3 | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [patternLoaded, setPatternLoaded] = useState(false);
  const drawingHistoryRef = useRef<ImageData[]>([]);
  
  const cantingTipRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Load pattern image berdasarkan level
  useEffect(() => {
    const initializeWithPattern = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      ctx.fillStyle = '#FEF7E8';
      ctx.fillRect(0, 0, 1024, 1024);
      
      try {
        const img = new Image();
        
        const imageLoadPromise = new Promise((resolve, reject) => {
          img.onload = () => {
            patternImageRef.current = img;
            setPatternLoaded(true);
            drawPatternOnCanvas(ctx, img);
            saveCanvasState(ctx);
            resolve(img);
          };
          img.onerror = () => {
            console.warn('Pattern image failed to load');
            drawDefaultPattern(ctx);
            setPatternLoaded(true);
            saveCanvasState(ctx);
            reject(new Error('Image load failed'));
          };
        });

        // Pilih pattern berdasarkan level
        let patternPath;
        switch(level) {
          case 1:
            patternPath = '/kawung-patern.png';
            break;
          case 2:
            patternPath = '/parang-patern.jpg';
            break;
          case 3:
            patternPath = '/truntum-patern.jpg';
            break;
          default:
            patternPath = '/kawung-patern.png';
        }

        img.src = patternPath;
        await Promise.race([
          imageLoadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

      } catch (error) {
        console.warn('Using fallback pattern:', error);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawDefaultPattern(ctx);
          setPatternLoaded(true);
          saveCanvasState(ctx);
        }
      }
    };

    initializeWithPattern();
  }, [level, patternUrl]);

  // Redraw pattern ketika patternOpacity berubah
  useEffect(() => {
    if (patternLoaded) {
      redrawPatternWithOpacity();
    }
  }, [patternOpacity]);

  const drawPatternOnCanvas = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, opacity = patternOpacity) => {
    ctx.fillStyle = '#FEF7E8';
    ctx.fillRect(0, 0, 1024, 1024);
    
    if (img && img.complete) {
      ctx.globalAlpha = opacity;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = 1024 / 1024;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspect > canvasAspect) {
        drawWidth = 1024;
        drawHeight = 1024 / imgAspect;
        offsetX = 0;
        offsetY = (1024 - drawHeight) / 2;
      } else {
        drawHeight = 1024;
        drawWidth = 1024 * imgAspect;
        offsetX = (1024 - drawWidth) / 2;
        offsetY = 0;
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.globalAlpha = 1.0;
    }
    
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  };

  const redrawPatternWithOpacity = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simpan state gambar user terlebih dahulu
    const userDrawing = ctx.getImageData(0, 0, 1024, 1024);
    
    // Clear canvas
    ctx.fillStyle = '#FEF7E8';
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Gambar pattern dengan opacity baru
    if (patternImageRef.current) {
      drawPatternOnCanvas(ctx, patternImageRef.current, patternOpacity);
    } else {
      drawDefaultPattern(ctx);
    }
    
    // Kembalikan gambar user
    if (drawingHistoryRef.current.length > 0) {
      const lastState = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
      ctx.putImageData(lastState, 0, 0);
    }
    
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  };
  
  const drawDefaultPattern = (ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    
    const spacing = 120;
    const radius = 35;
    
    for (let x = spacing; x < 1024 - spacing; x += spacing) {
      for (let y = spacing; y < 1024 - spacing; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x, y + radius);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  };

  const saveCanvasState = (ctx: CanvasRenderingContext2D) => {
    // Pastikan context valid
    if (!ctx) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingHistoryRef.current.push(imageData);
    } catch (error) {
      console.warn('Failed to save canvas state:', error);
    }
  };

  // Fungsi undo yang akan diexpose via ref
  const undoLastStroke = () => {
    if (drawingHistoryRef.current.length <= 1) return false;
    
    const canvas = canvasRef.current;
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    try {
      // Hapus state terakhir
      drawingHistoryRef.current.pop();
      
      // Kembalikan ke state sebelumnya
      const previousState = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
      ctx.putImageData(previousState, 0, 0);
      
      // Update texture
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to undo:', error);
      return false;
    }
  };

  // Fungsi reset canvas
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    try {
      // Reset canvas
      ctx.fillStyle = '#FEF7E8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Gambar ulang pattern jika ada
      if (patternImageRef.current) {
        drawPatternOnCanvas(ctx, patternImageRef.current, patternOpacity);
      } else {
        drawDefaultPattern(ctx);
      }
      
      // Reset history
      drawingHistoryRef.current = [];
      
      // Simpan state awal
      saveCanvasState(ctx);
      
      // Update texture
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to reset canvas:', error);
      return false;
    }
  };

  // Expose fungsi ke parent component
  useImperativeHandle(ref, () => ({
    undo: undoLastStroke,
    reset: resetCanvas,
    redrawPattern: redrawPatternWithOpacity
  }));

  const calculateCantingTipPosition = (cursorPosition: THREE.Vector3) => {
    const tipOffset = new THREE.Vector3(0, -0.55, -0.030);
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationFromEuler(new THREE.Euler(Math.PI / 3, 0, Math.PI / 8));
    tipOffset.applyMatrix4(rotationMatrix);
    const tipPosition = cursorPosition.clone().add(tipOffset);
    cantingTipRef.current.copy(tipPosition);
    return tipPosition;
  };

  const getUVFromWorldPosition = (worldPosition: THREE.Vector3, mesh: THREE.Mesh) => {
    const localPosition = new THREE.Vector3();
    localPosition.copy(worldPosition);
    mesh.worldToLocal(localPosition);
    const u = (localPosition.x / 1.5) + 0.5;
    const v = (localPosition.y / 1.5) + 0.5;
    return { u, v };
  };

  const handlePointerMove = (e: any) => {
    if (!meshRef.current || inkLeft <= 0) return;
    e.stopPropagation();
    
    const point = e.point;
    setCursorPos(point.clone());
    const tipPosition = calculateCantingTipPosition(point);

    if (isPointerDown && isDrawing && inkLeft > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && meshRef.current) {
        const uv = getUVFromWorldPosition(tipPosition, meshRef.current);
        if (uv.u >= 0 && uv.u <= 1 && uv.v >= 0 && uv.v <= 1) {
          const x = uv.u * 1024;
          const y = (1 - uv.v) * 1024;
          
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#7C2D12';
          ctx.fill();
          
          if (textureRef.current) {
            textureRef.current.needsUpdate = true;
          }
          
          onDraw(true);
        }
      }
    }
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (inkLeft <= 0) return;
    
    setIsPointerDown(true);
    onDraw(true);
    
    if (meshRef.current) {
      const point = e.point;
      const tipPosition = calculateCantingTipPosition(point);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const uv = getUVFromWorldPosition(tipPosition, meshRef.current);
        
        if (uv.u >= 0 && uv.u <= 1 && uv.v >= 0 && uv.v <= 1) {
          const x = uv.u * 1024;
          const y = (1 - uv.v) * 1024;
          
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#7C2D12';
          ctx.fill();
          
          if (textureRef.current) {
            textureRef.current.needsUpdate = true;
          }
          
          // Simpan state
          saveCanvasState(ctx);
        }
      }
    }
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (isPointerDown) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        saveCanvasState(ctx);
      }
    }
    setIsPointerDown(false);
    onDraw(false);
  };

  const handlePointerLeave = (e: any) => {
    e.stopPropagation();
    setIsPointerDown(false);
    setCursorPos(null);
    onDraw(false);
  };

  return (
    <group>
      <mesh 
        ref={meshRef}
        position={[0, 1.3, -1]} 
        rotation={[-Math.PI / 6, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial 
          side={THREE.DoubleSide}
          toneMapped={false}
        >
          <canvasTexture 
            ref={textureRef}
            attach="map"
            image={canvasRef.current}
            minFilter={THREE.LinearFilter}
            magFilter={THREE.LinearFilter}
            anisotropy={16}
          />
        </meshStandardMaterial>
      </mesh>

      {/* Visual Model Canting */}
      {cursorPos && (
        <CantingModel 
          position={[cursorPos.x, cursorPos.y + 0.02, cursorPos.z + 0.01]} 
          rotation={[Math.PI / 3, 0, Math.PI / 8]}
          isDrawing={isPointerDown && isDrawing}
          inkLeft={inkLeft}
        />
      )}
    </group>
  );
});

// Komponen Tembok Rumah
const HouseWalls = () => {
  return (
    <group>
      {/* Dinding Belakang */}
      <mesh position={[0, 2.5, -4]} receiveShadow>
        <boxGeometry args={[8, 5, 0.3]} />
        <meshStandardMaterial color="#E8D5B7" roughness={0.8} />
      </mesh>

      {/* Dinding Kiri */}
      <mesh position={[-4, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 5, 0.3]} />
        <meshStandardMaterial color="#E8D5B7" roughness={0.8} />
      </mesh>

      {/* Dinding Kanan */}
      <mesh position={[4, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 5, 0.3]} />
        <meshStandardMaterial color="#E8D5B7" roughness={0.8} />
      </mesh>

      {/* Dinding Depan */}
      <group position={[0, 2.5, 4]}>
        <mesh position={[0, 1.25, 0]} receiveShadow>
          <boxGeometry args={[8, 2.5, 0.3]} />
          <meshStandardMaterial color="#E8D5B7" roughness={0.8} />
        </mesh>
        
        <mesh position={[-2.5, -1, 0]} receiveShadow>
          <boxGeometry args={[3, 2, 0.3]} />
          <meshStandardMaterial color="#E8D5B7" roughness={0.8} />
        </mesh>
        
        <mesh position={[2.5, -1, 0]} receiveShadow>
          <boxGeometry args={[3, 2, 0.3]} />
          <meshStandardMaterial color="#E8D5B7" roughness={0.8} />
        </mesh>
      </group>

      {/* Atap */}
      <mesh position={[0, 5, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Plafon */}
      <mesh position={[0, 4.9, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.7} />
      </mesh>

      {/* Bingkai Jendela */}
      <mesh position={[-3.8, 2.2, 0.1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[1.5, 1.2, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      <mesh position={[-3.8, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      <mesh position={[3.8, 2.2, 0.1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[1.5, 1.2, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      <mesh position={[3.8, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Lampu Gantung */}
      <mesh position={[0, 4.8, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.3]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0, 4.6, 0]} intensity={0.8} color="#FFF8E1" distance={8} />

      {/* Hiasan Dinding */}
      <mesh position={[0, 2.5, -3.85]} receiveShadow>
        <boxGeometry args={[1.5, 1, 0.05]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.5, -3.8]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
    </group>
  );
};

// Custom OrbitControls
const CustomOrbitControls = (props: any) => {
  const { gl, camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: null 
      };
      controls.enabled = !props.disabled;
    }
  }, [props.disabled]);

  return <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} {...props} />;
};

// Scene
const BatikScene = ({ inkLeft, isDrawing, onDraw, onRefillInk, controlsDisabled, level, batikClothRef, patternOpacity }: any) => {
  const batikPatterns = [
    {
      id: "batik-kawung",
      name: "Batik Tulis Motif Kawung",
      description: "Motif klasik geometris berbentuk bulatan lonjong",
      philosophy: "Melambangkan kebijaksanaan dan pengendalian diri",
      patternUrl: "/kawung-patern.png"
    },
    {
      id: "batik-parang",
      name: "Batik Tulis Motif Parang",
      description: "Motif garis diagonal tegas menyerupai huruf 'S'",
      philosophy: "Melambangkan kekuatan dan semangat pantang menyerah",
      patternUrl: "/parang-patern.jpg"
    },
    {
      id: "batik-truntum",
      name: "Batik Tulis Motif Truntum",
      description: "Motif bertabur kembang kecil menyerupai bintang",
      philosophy: "Melambangkan cinta yang tulus dan bersemi kembali",
      patternUrl: "/truntum-patern.jpg"
    }
  ];

  const currentPattern = batikPatterns[level - 1];

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 8, 3]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fff8e1" />
      
      <color attach="background" args={['#87CEEB']} />

      {/* Rumah dengan Tembok */}
      <HouseWalls />

      {/* Tanah / Lantai */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>

      {/* Karpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Meja Batik */}
      <mesh position={[0, 0.44, -1]} receiveShadow castShadow>
        <boxGeometry args={[2.2, 0.08, 1.8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.7} />
      </mesh>

      {/* Kaki Meja */}
      <mesh position={[-0.9, 0.22, -0.3]} receiveShadow castShadow>
        <boxGeometry args={[0.08, 0.44, 0.08]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
      <mesh position={[0.9, 0.22, -0.3]} receiveShadow castShadow>
        <boxGeometry args={[0.08, 0.44, 0.08]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
      <mesh position={[-0.9, 0.22, -1.7]} receiveShadow castShadow>
        <boxGeometry args={[0.08, 0.44, 0.08]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
      <mesh position={[0.9, 0.22, -1.7]} receiveShadow castShadow>
        <boxGeometry args={[0.08, 0.44, 0.08]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>

      {/* Kompor dan Wajan Batik */}
      <BatikEquipment onRefillInk={onRefillInk} inkLeft={inkLeft} />

      {/* Kain Batik dengan ref */}
      <BatikCloth 
        ref={batikClothRef}
        patternUrl={currentPattern.patternUrl}
        isDrawing={isDrawing}
        onDraw={onDraw}
        inkLeft={inkLeft}
        level={level}
        patternOpacity={patternOpacity}
      />

      {/* Instruksi */}
      <Text 
        position={[0, 2.4, -1]} 
        fontSize={0.12} 
        color="#FFA726" 
        anchorX="center"
        textAlign="center"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        Klik kiri + tahan pada kain untuk mencanting
      </Text>

      {/* Panel Tinta */}
      <group position={[-1.3, 1.5, -1]}>
        <Text position={[0, 0.3, 0]} fontSize={0.08} color="#FFA726" anchorX="center" outlineWidth={0.005} outlineColor="#000">
          Tinta Canting
        </Text>
        <Text position={[0, 0.2, 0]} fontSize={0.1} color="white" anchorX="center" outlineWidth={0.005} outlineColor="#000">
          {Math.round(inkLeft)}%
        </Text>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.02]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        <mesh position={[-0.25 + (inkLeft / 100) * 0.25, 0.08, 0.02]}>
          <boxGeometry args={[0.5 * (inkLeft / 100), 0.04, 0.025]} />
          <meshBasicMaterial color={inkLeft > 20 ? '#D84315' : '#ff4444'} />
        </mesh>
      </group>

      {/* Info Level */}
      <group position={[1.3, 1.5, -1]}>
        <Text position={[0, 0.3, 0]} fontSize={0.08} color="#4CAF50" anchorX="center" outlineWidth={0.005} outlineColor="#000">
          Level {level}
        </Text>
        <Text position={[0, 0.2, 0]} fontSize={0.07} color="white" anchorX="center" outlineWidth={0.005} outlineColor="#000" maxWidth={0.8}>
          {currentPattern.name}
        </Text>
      </group>

      {/* Info Pattern Opacity */}
      <group position={[1.3, 1.8, -1]}>
        <Text position={[0, 0.3, 0]} fontSize={0.06} color="#FF9800" anchorX="center" outlineWidth={0.005} outlineColor="#000">
          Opacity Pattern
        </Text>
        <Text position={[0, 0.2, 0]} fontSize={0.08} color="white" anchorX="center" outlineWidth={0.005} outlineColor="#000">
          {Math.round(patternOpacity * 100)}%
        </Text>
      </group>

      <CustomOrbitControls 
        target={[0, 1.3, -1]} 
        enableZoom={true}
        enablePan={true}
        minDistance={1.5}
        maxDistance={6}
        enableDamping={true}
        dampingFactor={0.08}
        disabled={controlsDisabled}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

// Main Component
const MencantingBatikVR = () => {
  const [inkLeft, setInkLeft] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [activeTab, setActiveTab] = useState<'philosophy' | 'usage' | 'history'>('philosophy');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [patternOpacity, setPatternOpacity] = useState(0.15); // Default opacity
  
  const drawingIntervalRef = useRef<number | null>(null);
  const batikClothRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const batikPatterns = [
    {
      id: "batik-kawung",
      name: "Batik Tulis Motif Kawung",
      description: "Motif klasik geometris berbentuk bulatan lonjong yang disusun rapi",
      philosophy: "Melambangkan kebijaksanaan dan pengendalian diri. Terinspirasi dari buah aren (kolang-kaling).",
      usage: "Cocok untuk acara formal dan pertemuan bisnis.",
      history: "Dahulu merupakan 'Batik Larangan' di Keraton Yogyakarta.",
      targetScore: 70,
      timeLimit: 300
    },
    {
      id: "batik-parang",
      name: "Batik Tulis Motif Parang",
      description: "Motif garis diagonal tegas menyerupai huruf 'S' yang saling menjalin",
      philosophy: "Melambangkan kekuatan dan semangat pantang menyerah.",
      usage: "Cocok untuk acara kenegaraan dan pembukaan bisnis.",
      history: "Salah satu motif tertua di Jawa yang diciptakan oleh pendiri Keraton Mataram.",
      targetScore: 75,
      timeLimit: 360
    },
    {
      id: "batik-truntum",
      name: "Batik Tulis Motif Truntum",
      description: "Motif bertabur kembang kecil menyerupai bintang atau melati",
      philosophy: "Melambangkan cinta yang tulus dan bersemi kembali.",
      usage: "Wajib digunakan pada acara pernikahan.",
      history: "Diciptakan oleh Kanjeng Ratu Kencana (Permaisuri Sunan Pakubuwono III).",
      targetScore: 80,
      timeLimit: 420
    }
  ];

  const currentPattern = batikPatterns[currentLevel - 1];

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/gamelan-kebogiro.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Music control
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0 && inkLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'playing' && (timeLeft <= 0 || inkLeft <= 0)) {
      finishGame();
    }

    return () => clearTimeout(timer);
  }, [gameState, timeLeft, inkLeft]);

  const handleDraw = (active: boolean) => {
    setIsDrawing(active);
    
    if (active && inkLeft > 0 && gameState === 'playing') {
      if (drawingIntervalRef.current === null) {
        drawingIntervalRef.current = window.setInterval(() => {
          setInkLeft(prev => Math.max(0, prev - 0.15));
        }, 100);
      }
    } else {
      if (drawingIntervalRef.current !== null) {
        clearInterval(drawingIntervalRef.current);
        drawingIntervalRef.current = null;
      }
    }
  };

  const refillInk = () => {
    setInkLeft(100);
  };

  const startGame = () => {
    setGameState('playing');
    setInkLeft(100);
    setTimeLeft(currentPattern.timeLimit);
    setScore(0);
    if (batikClothRef.current) {
      batikClothRef.current.reset();
    }
  };

  const finishGame = () => {
    setGameState('finished');
    const baseScore = Math.min(100, Math.floor((inkLeft / 100) * 70));
    const timeBonus = Math.floor((timeLeft / currentPattern.timeLimit) * 30);
    const finalScore = Math.min(100, baseScore + timeBonus);
    setScore(finalScore);
    
    if (drawingIntervalRef.current !== null) {
      clearInterval(drawingIntervalRef.current);
      drawingIntervalRef.current = null;
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setInkLeft(100);
    setIsDrawing(false);
    setTimeLeft(currentPattern.timeLimit);
    setScore(0);
    
    if (drawingIntervalRef.current !== null) {
      clearInterval(drawingIntervalRef.current);
      drawingIntervalRef.current = null;
    }
    
    if (batikClothRef.current) {
      batikClothRef.current.reset();
    }
  };

  const nextLevel = () => {
    if (currentLevel < 3) {
      setCurrentLevel(currentLevel + 1);
      resetGame();
    }
  };

  const previousLevel = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1);
      resetGame();
    }
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleUndo = () => {
    if (batikClothRef.current) {
      batikClothRef.current.undo();
      setInkLeft(prev => Math.min(100, prev + 5));
    }
  };

  // FUNGSI UNTUK MENAIKKAN OPACITY
  const increasePatternOpacity = () => {
    setPatternOpacity(prev => {
      const newOpacity = Math.min(1.0, prev + 0.1);
      // Update pattern di canvas jika sudah ada gambar user
      if (batikClothRef.current && gameState === 'playing') {
        setTimeout(() => {
          batikClothRef.current.redrawPattern();
        }, 100);
      }
      return newOpacity;
    });
  };

  // FUNGSI UNTUK MENURUNKAN OPACITY
  const decreasePatternOpacity = () => {
    setPatternOpacity(prev => {
      const newOpacity = Math.max(0.0, prev - 0.1);
      // Update pattern di canvas jika sudah ada gambar user
      if (batikClothRef.current && gameState === 'playing') {
        setTimeout(() => {
          batikClothRef.current.redrawPattern();
        }, 100);
      }
      return newOpacity;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'philosophy':
        return currentPattern.philosophy;
      case 'usage':
        return currentPattern.usage;
      case 'history':
        return currentPattern.history;
      default:
        return currentPattern.philosophy;
    }
  };

  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  useEffect(() => {
    return () => {
      if (drawingIntervalRef.current !== null) {
        clearInterval(drawingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      
      {/* Control Panel Atas */}
      <div className="absolute top-4 left-4 z-10 text-white bg-black/80 p-5 rounded-xl backdrop-blur-sm border border-amber-500/30">
        <h1 className="text-3xl font-bold mb-2 text-amber-400">🏠 Mencanting Batik VR</h1>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">Tinta:</span>
          <div className="flex-1 bg-gray-700 rounded-full h-6 w-32 overflow-hidden">
            <div 
              className={`h-full transition-all ${inkLeft > 20 ? 'bg-amber-600' : 'bg-red-500'}`}
              style={{ width: `${inkLeft}%` }}
            />
          </div>
          <span className="text-xl font-bold text-amber-400">{Math.round(inkLeft)}%</span>
        </div>
        
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="text-green-400">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={16} />
            <span className="text-blue-400">Skor: {score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={16} />
            <span className="text-yellow-400">Level {currentLevel}/3</span>
          </div>
        </div>

        {/* KONTROL OPACITY */}
        <div className="mt-4 pt-4 border-t border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-amber-300">Opacity Pattern:</span>
            <span className="text-lg font-bold text-amber-400">{Math.round(patternOpacity * 100)}%</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={decreasePatternOpacity}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition-colors"
            >
              -
            </button>
            <button 
              onClick={increasePatternOpacity}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel Kanan */}
      <div className="absolute top-4 right-4  z-10 flex flex-col gap-3">
        {/* Music Control */}
        <button 
          onClick={toggleMusic}
          className="bg-black/80 w-12 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          title={isMusicPlaying ? "Matikan Musik" : "Nyalakan Musik"}
        >
          {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>

        {/* Undo */}
        <button 
          onClick={handleUndo}
          className="bg-black/80 w-12 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          title="Undo"
          disabled={gameState !== 'playing'}
        >
          <Undo size={24} />
        </button>

        {/* Reset */}
        <button 
          onClick={resetGame}
          className="bg-black/80 w-12 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          title="Reset"
        >
          <RotateCcw size={24} />
        </button>

        {/* Level Navigation */}
        <div className="bg-black/80 w-50 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button 
              onClick={previousLevel}
              disabled={currentLevel === 1}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white p-2 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-white font-bold">Level {currentLevel}</span>
            <button 
              onClick={nextLevel}
              disabled={currentLevel === 3}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white p-2 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <span className="text-xs text-amber-300 text-center">{currentPattern.name}</span>
        </div>
      </div>

      {/* Informasi Motif */}
      <div className="absolute bottom-24 left-4 z-10 bg-black/80 text-white p-4 rounded-xl backdrop-blur-sm max-w-xs border border-blue-500/30">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('philosophy')}
            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'philosophy' ? 'bg-amber-600' : 'bg-gray-700'}`}
          >
            <Sparkles size={14} />
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'usage' ? 'bg-amber-600' : 'bg-gray-700'}`}
          >
            <Book size={14} />
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'history' ? 'bg-amber-600' : 'bg-gray-700'}`}
          >
            <History size={14} />
          </button>
        </div>
        <h3 className="font-bold text-amber-300 mb-2">
          {activeTab === 'philosophy' ? 'Filosofi' : 
           activeTab === 'usage' ? 'Penggunaan' : 'Sejarah'}
        </h3>
        <p className="text-sm text-gray-200">{getTabContent()}</p>
      </div>

      {/* Control Panel Bawah */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-4">
        {gameState === 'idle' ? (
          <button 
            onClick={startGame}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">🎨</span>
            Mulai Mencanting
          </button>
        ) : gameState === 'playing' ? (
          <>
            <button 
              onClick={refillInk}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Droplets size={20} />
              Isi Ulang Tinta
            </button>
            <button 
              onClick={finishGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Award size={20} />
              Selesai Mencanting
            </button>
          </>
        ) : (
          <button 
            onClick={resetGame}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Main Lagi
          </button>
        )}
      </div>

      {/* Hasil Game Overlay */}
      {gameState === 'finished' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-8 rounded-2xl max-w-md text-center">
            <Award size={64} className="mx-auto mb-4 text-amber-400" />
            <h2 className="text-3xl font-bold mb-2">Hasil Mencanting</h2>
            <p className="text-5xl font-bold text-amber-400 mb-6">{score}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-500/30 backdrop-blur p-3 rounded-2xl">
                <p className="text-blue-100 text-xs">Tinta Tersisa</p>
                <p className="text-xl font-bold">{Math.round(inkLeft)}%</p>
              </div>
              <div className="bg-green-500/30 backdrop-blur p-3 rounded-2xl">
                <p className="text-green-100 text-xs">Waktu Tersisa</p>
                <p className="text-xl font-bold">{formatTime(timeLeft)}</p>
              </div>
            </div>

            <p className="text-blue-200 mb-6">
              {score >= currentPattern.targetScore 
                ? '🎉 Luar biasa! Anda berhasil menyelesaikan level ini!'
                : '✨ Bagus! Terus latih keterampilan mencanting Anda!'
              }
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={resetGame}
                className="bg-white text-blue-800 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition flex-1"
              >
                Ulangi Level
              </button>
              {currentLevel < 3 && (
                <button 
                  onClick={nextLevel}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition flex-1"
                >
                  Level {currentLevel + 1}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="bg-gradient-to-br from-amber-900 to-orange-900 text-white p-8 rounded-2xl max-w-2xl text-center border-2 border-amber-500/50">
            <h3 className="text-3xl font-bold mb-6 text-amber-400">🏠 Cara Mencanting Batik VR</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-amber-800/50 p-4 rounded-xl">
                <div className="text-4xl mb-3">🎨</div>
                <h4 className="font-bold mb-2">Mencanting</h4>
                <p className="text-sm">Klik & tahan pada kain untuk menggambar mengikuti pola</p>
              </div>
              <div className="bg-amber-800/50 p-4 rounded-xl">
                <div className="text-4xl mb-3">🔥</div>
                <h4 className="font-bold mb-2">Isi Tinta</h4>
                <p className="text-sm">Klik kompor untuk mengisi ulang tinta yang habis</p>
              </div>
              <div className="bg-amber-800/50 p-4 rounded-xl">
                <div className="text-4xl mb-3">↶</div>
                <h4 className="font-bold mb-2">Undo</h4>
                <p className="text-sm">Tombol undo untuk membatalkan goresan terakhir</p>
              </div>
              <div className="bg-amber-800/50 p-4 rounded-xl">
                <div className="text-4xl mb-3">🎵</div>
                <h4 className="font-bold mb-2">Musik</h4>
                <p className="text-sm">Nyalakan musik tradisional untuk pengalaman lebih</p>
              </div>
            </div>
            <div className="bg-amber-800/30 p-4 rounded-xl mb-6">
              <h4 className="font-bold mb-2">🎯 Kontrol Opacity Pattern</h4>
              <p className="text-sm">Gunakan tombol + dan - untuk menyesuaikan kecerahan pola batik</p>
            </div>
            <button 
              onClick={() => setShowInstructions(false)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-colors shadow-lg"
            >
              Mulai Pengalaman VR 🚀
            </button>
          </div>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 2, 3.5], fov: 50 }}>
        <BatikScene 
          inkLeft={inkLeft}
          isDrawing={isDrawing}
          onDraw={handleDraw}
          onRefillInk={refillInk}
          controlsDisabled={isDrawing}
          level={currentLevel}
          batikClothRef={batikClothRef}
          patternOpacity={patternOpacity}
        />
      </Canvas>
    </div>
  );
};

export default MencantingBatikVR;