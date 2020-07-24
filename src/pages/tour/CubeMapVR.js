import React from 'react';
import { useLoader } from 'react-three-fiber';
import { OrbitControls } from 'drei'
import { TextureLoader, FrontSide, DataTexture, RGBAFormat } from 'three';
import renderFace from "./../../utils/imageConvert";


// input the image equirectangular data
// return a texture for each face as a collective material
function processFace(imgData) {
  const faces = [
    'px', 'nx',
    'py', 'ny',
    'pz', 'nz'
  ];
  // for each face
  return faces.map(faceName => {
    // get that face using sample
    const [faceData, faceWidth, faceHeight] = renderFace(imgData, faceName);
    // Create a texture based on the data
    const texture = new DataTexture(faceData.data, faceWidth, faceHeight, RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  });
}



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

  const textureImg = useLoader(TextureLoader, panorama_image);

  const { width, height } = textureImg.image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(textureImg.image, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const textures = processFace(imageData);

  return (
    <>
      <group dispose={null}>
        <mesh>
          {/*Inverse on z axis to make cubemap
          * this is like setting the scale [1, 1, -1]  */}
          <boxGeometry attach="geometry" args={[20, 20, -20]} />
          {/* the cube map textures, TODO: should fill will 6 faces */}
          {textures.map((faceTexture, index) => {
            return (<meshBasicMaterial key={index} attachArray="material" map={faceTexture} side={FrontSide} />);
          })}
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