

import { useFrame, useThree } from "react-three-fiber";

const AnimateCamera = ({ isRotating, setIsRoating }) => {

    const { camera } = useThree();

    useFrame(() => { if (isRotating) camera.position.set(0, 0, 1) })

    return(null)
};

export { AnimateCamera };