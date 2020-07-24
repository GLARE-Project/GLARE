import React, {forwardRef, useRef, useEffect} from 'react'
import { extend, useThree, useFrame } from 'react-three-fiber'
import { DeviceOrientationControls as DeviceOrientationControlsImp } from 'three/examples/jsm/controls/DeviceOrientationControls';
import mergeRefs from 'react-merge-refs'


extend({ DeviceOrientationControlsImp })

export const DeviceOrientationControls = forwardRef((props, ref) => {
    const { camera } = useThree();
    const controls = useRef();

    useFrame(() => controls.current.update());

    useEffect(() => {
        const control = controls.current;
        control.connect()
        return () => control.dispose()
    })

    return (<deviceOrientationControlsImp ref={mergeRefs([controls, ref])} args={[camera]} {...props} />)
});