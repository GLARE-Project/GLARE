import React from 'react';
import { useLoader } from 'react-three-fiber';
import { OrbitControls } from 'drei'
import { TextureLoader, FrontSide, Vector3 } from 'three';

const OverlayVR = ({ data }) => {
  const { overlay_size = 10, overlay_offset_x = 0, overlay_offset_y = 0, VR_overylay } = data;
  const texture = useLoader(TextureLoader, VR_overylay);

  return (
    <mesh position={[overlay_offset_x, overlay_offset_y, -9]}>
      {/* only show the backside of texture and rotate it to the front
            * this is like setting the scale [-1, 1, 1]  */}
      <planeGeometry attach="geometry" args={[overlay_size, overlay_size]} />
      <meshBasicMaterial attach="material" map={texture} side={FrontSide} />
    </mesh>
  );

};


const CubeMapVR = React.memo(({ data }) => {
  const { panorama_image } = data;

  const texture = useLoader(TextureLoader, panorama_image);

  // Begin shaders to add mipmaps, remove seams, and convert to cubemap
  const vertexShader = `
  varying vec3 worldPosition;
  void main () {
    vec4 p = vec4 (position, 1.0);
    worldPosition = (modelMatrix * p).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * p;
  }`

  const fragmentShader = `
  uniform sampler2D map;
  uniform vec3 placement;
  varying vec3 worldPosition;
  const float seamWidth = 0.01;
  void main () {
    vec3 R = worldPosition - placement;
    float r = length (R);
    float c = -R.y / r;
    float theta = acos (c);
    float phi = atan (R.x, -R.z);
    float seam = 
      max (0.0, 1.0 - abs (R.x / r) / seamWidth) *
      clamp (1.0 + (R.z / r) / seamWidth, 0.0, 1.0);
    gl_FragColor = texture2D (map, vec2 (
      0.5 + phi / ${2 * Math.PI},
      theta / ${ Math.PI }
    ), -2.0 * log2(1.0 + c * c) -12.3 * seam);
  }`

  const uniforms = {
    map: {
      type: 't', value: texture
    },
    placement: {
      type: 'v3', value: new Vector3()
    }
  }

  // end shader content

  return (
    <>
      <group dispose={null}>
        <mesh>
          {/*Inverse on z axis to make cubemap
          * this is like setting the scale [1, 1, -1]  */}
          <boxGeometry attach="geometry" args={[20, 20, -20]} />
          <shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragmentShader} vertexShader={vertexShader} />
        </mesh>
        <OverlayVR data={data} />
      </group>
      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={1}
        maxDistance={3}
      />
    </>
  );
});

export default CubeMapVR;