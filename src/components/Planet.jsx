import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function Planet(props) {
  const shapeContainer = useRef(null);
  const shperesContainer = useRef(null);
  const ringContainer = useRef(null);
  const { nodes, materials } = useGLTF("/models/Planet.glb");

  const geometries = useMemo(
    () => ({
      sphere: nodes.Sphere.geometry,
      sphere2: nodes.Sphere2.geometry,
      ring: nodes.Ring.geometry,
    }),
    [nodes]
  );

  const mats = useMemo(
    () => ({
      mat1: materials["Material.002"],
      mat2: materials["Material.001"],
    }),
    [materials]
  );

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(shapeContainer.current.position, {
      y: 5,
      duration: 3,
      ease: "circ.out",
    });
    tl.from(
      shperesContainer.current.rotation,
      {
        x: 0,
        y: Math.PI,
        z: -Math.PI,
        duration: 10,
        ease: "power1.inOut",
      },
      "-=25%"
    );
    tl.from(
      ringContainer.current.rotation,
      {
        x: 0.8,
        y: 0,
        z: 0,
        duration: 10,
        ease: "power1.inOut",
      },
      "<"
    );
  }, []);

  return (
    <group ref={shapeContainer} {...props} dispose={null}>
      <group ref={shperesContainer}>
        <mesh
          castShadow
          receiveShadow
          geometry={geometries.sphere}
          material={mats.mat1}
          rotation={[0, 0, 0.741]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={geometries.sphere2}
          material={mats.mat2}
          position={[0.647, 1.03, -0.724]}
          rotation={[0, 0, 0.741]}
          scale={0.223}
        />
      </group>
      <mesh
        ref={ringContainer}
        castShadow
        receiveShadow
        geometry={geometries.ring}
        material={mats.mat2}
        rotation={[-0.124, 0.123, -0.778]}
        scale={2}
      />
    </group>
  );
}

useGLTF.preload("/models/Planet.glb");
