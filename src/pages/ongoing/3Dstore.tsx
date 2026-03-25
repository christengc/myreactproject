// Shelf component: a hollow shelf grouped for easy movement
type ShelfProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  [key: string]: any;
};
function Shelf({ position = [0, 0, 0], rotation = [0, 0, 0], ...props }: ShelfProps) {
    return (
        <group position={position} rotation={rotation} {...props}>
            {/* Vertical sides */}
            <mesh position={[-5.35, 3, 0]} castShadow>
                <boxGeometry args={[0.3, 6, 1]} />
                <meshStandardMaterial color="#D1D5DB" />
            </mesh>
            <mesh position={[5.35, 3, 0]} castShadow>
                <boxGeometry args={[0.3, 6, 1]} />
                <meshStandardMaterial color="#D1D5DB" />
            </mesh>
            {/* Horizontal shelves */}
            <mesh position={[0, 5.5, 0]} castShadow>
                <boxGeometry args={[10, 0.3, 1]} />
                <meshStandardMaterial color="#D1D5DB" />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
                <boxGeometry args={[10, 0.3, 1]} />
                <meshStandardMaterial color="#D1D5DB" />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[10, 0.3, 1]} />
                <meshStandardMaterial color="#D1D5DB" />
            </mesh>
        </group>
    );
}

import { Breadcrumb, Container, Heading, Text, Box, Button, HStack, Icon } from "@chakra-ui/react";
import { TiArrowBack } from "react-icons/ti";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";


// Yamaha M1 GLB Model Loader
function YamahaM1Model(props: any) {
    const gltf = useGLTF("/models/yamaha m1.glb");
    return <primitive object={gltf.scene} scale={1.5} position={[0, 0, 0]} {...props} />;
}

// CameraController enables WASD/arrow key movement while OrbitControls is active
function CameraController() {
    const { camera } = useThree();
    const move = useRef({ forward: false, backward: false, left: false, right: false });
    const speed = 0.15;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    move.current.forward = true;
                    break;
                case "KeyS":
                case "ArrowDown":
                    move.current.backward = true;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    move.current.left = true;
                    break;
                case "KeyD":
                case "ArrowRight":
                    move.current.right = true;
                    break;
                default:
                    break;
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    move.current.forward = false;
                    break;
                case "KeyS":
                case "ArrowDown":
                    move.current.backward = false;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    move.current.left = false;
                    break;
                case "KeyD":
                case "ArrowRight":
                    move.current.right = false;
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useFrame(() => {
        // Move in the direction the camera is facing (XZ plane)
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();
        const right = new THREE.Vector3();
        right.crossVectors(camera.up, direction).normalize();

        if (move.current.forward) {
            camera.position.addScaledVector(direction, speed);
        }
        if (move.current.backward) {
            camera.position.addScaledVector(direction, -speed);
        }
        if (move.current.left) {
            camera.position.addScaledVector(right, speed);
        }
        if (move.current.right) {
            camera.position.addScaledVector(right, -speed);
        }
    });
    return null;
}

const fontLuckiestGuy = {
    fontFamily: 'LuckiestGuy'
};



function StoreScene() {

    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[0, 3, 0]} intensity={1.5} />
            {/* Yamaha M1 Motorbike Model */}
            <YamahaM1Model position={[-21, 0, 14]} scale={1}/>
            {/* Sidewalk in front of the right-side doors (matches building width and floor height) */}
            <mesh position={[20.5, -0.5, 0]} receiveShadow>
                <boxGeometry args={[21, 1, 40]} />
                <meshStandardMaterial color="#bcbcbc" roughness={0.7} metalness={0.1} />
            </mesh>
            {/* Floor */}
            <mesh position={[-10, -0.5, 0]} receiveShadow>
                <boxGeometry args={[40, 1, 40]} />
                <meshStandardMaterial color="#E0C097" />
            </mesh>
            {/* Simple box as a placeholder for a table */}
                <mesh position={[-20, 0.5, -10]} castShadow>
                    <boxGeometry args={[6, 2, 6]} />
                    <meshStandardMaterial color="#8B5A2B" />
                </mesh>
            {/* Hollow shelf at front (now a component) */}
            <Shelf position={[-10,0,18.5]} />
            {/* Hollow shelf at back (now a component) */}
            <Shelf position={[-10,0,-18.5]} />
            {/* Walls */}
            {/* Right wall (solid) */}
            <mesh position={[-10, 4, -19.5]} receiveShadow castShadow>
                <boxGeometry args={[40, 8, 1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Back wall (solid) */}
            <mesh position={[-29.5, 4, 0]} receiveShadow castShadow>
                <boxGeometry args={[1, 8, 40]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Front wall segments (leave 80% gap for door/window) */}
            {/* Front left segment */}
            <mesh position={[9.5, 4, 13]} receiveShadow castShadow>
                <boxGeometry args={[1, 8, 12]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Front right segment */}
            <mesh position={[9.5, 4, -13]} receiveShadow castShadow>
                <boxGeometry args={[1, 8, 12]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Glass wall for open part of right side */}
                <mesh position={[10.5, 4, 0]} receiveShadow castShadow>
                    <boxGeometry args={[0.3, 8, 16]} />
                    <meshPhysicalMaterial color="#aee6f9" transparent opacity={0.4} roughness={0.1} metalness={0.25} transmission={0.9} thickness={0.2} />
                </mesh>
                        {/* Double glass doors in the middle of the right glass wall (open at 50 degrees) */}
                        {/* Left door (rotated -50deg) */}
                        <mesh position={[10.5, 3.5, -3]} rotation={[0, -0.8727, 0]} receiveShadow castShadow>
                            <boxGeometry args={[0.1, 7, 3]} />
                            <meshPhysicalMaterial color="#b3e0fc" transparent opacity={0.5} roughness={0.08} metalness={0.2} transmission={0.95} thickness={0.08} />
                        </mesh>
                        {/* Right door (rotated +50deg) */}
                        <mesh position={[10.5, 3.5, 3]} rotation={[0, 0.8727, 0]} receiveShadow castShadow>
                            <boxGeometry args={[0.1, 7, 3]} />
                            <meshPhysicalMaterial color="#b3e0fc" transparent opacity={0.5} roughness={0.08} metalness={0.2} transmission={0.95} thickness={0.08} />
                        </mesh>
            {/* Left wall (solid) */}
            <mesh position={[-10, 4, 19.5]} receiveShadow castShadow>
                <boxGeometry args={[40, 8, 1]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Plants on each side of the right-side door (outside glass wall) */}
            {/* Left plant */}
            <mesh position={[15.5, 0.7, 5.5]} castShadow>
                <cylinderGeometry args={[0.8, 1.0, 1.4, 24]} />
                <meshStandardMaterial color="#a0522d" />
            </mesh>
            <mesh position={[15.5, 2.1, 5.5]} castShadow>
                <sphereGeometry args={[1.4, 24, 24]} />
                <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* Right plant */}
            <mesh position={[15.5, 0.7, -5.5]} castShadow>
                <cylinderGeometry args={[0.8, 1.0, 1.4, 24]} />
                <meshStandardMaterial color="#a0522d" />
            </mesh>
            <mesh position={[15.5, 2.1, -5.5]} castShadow>
                <sphereGeometry args={[1.4, 24, 24]} />
                <meshStandardMaterial color="#228B22" />
            </mesh>
            {/* More boxes/items can be added here */}
        </>
    );
}

export default function Store3DPage() {
    return (
        <Container position="relative">
            <Breadcrumb.Root size="lg" ml={{base:"0em", sm:"0em", md:"-16em", lg:"-16em"}} mt="0.5em" mb="0.5em">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="../" color="#2B4570">Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/ongoing" color="#2B4570">Ongoing Work</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="#2B4570">3D Store</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            <Box className="dropShadow">
                <HStack justifyItems="center" mb="1em">
                    <Button asChild variant="outline" size="xs" rounded="full" colorPalette="teal" color="#2B4570">
                        <a href="/ongoing"><Icon color="cyan.solid" size="2xl"><TiArrowBack /></Icon></a>
                    </Button>
                    <Heading as="h2" size="2xl" style={fontLuckiestGuy} ml="0.5em">3D Store Project</Heading>
                </HStack>
                <Text textStyle="xl" maxWidth="30em" mb="1em">
                    Do you remember when the internet was going to be 3d and virtual reality? the promise of the late 90s? 
                    Then later again in the 2000s a 3d world like second life was the promise and 
                    finally in the 2020s the metaverse was going to be the future? 
                    <br></br><br></br>
                    well, I am still waiting for that, but in the meantime, I wanted to experiment with creating a simple 3D store demo using React Three Fiber (R3F) and three.js. Use WASD or arrow keys to move the camera.
                    <br></br><br></br>
                    This is a 3D store demo using React Three Fiber (R3F) and three.js. Use WASD or arrow keys to move the camera.
                </Text>
                <Box w="100%" maxW="700px" h="90vh" p={0} m={0}>
                    <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }} style={{ width: '100%', height: '100%' }}>
                        <CameraController />
                        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                        <StoreScene />
                    </Canvas>
                </Box>
            </Box>
        </Container>
    );
}
