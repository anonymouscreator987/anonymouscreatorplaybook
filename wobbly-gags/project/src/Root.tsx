import React from 'react';
import {Composition} from 'remotion';
import {Gag9, GAG9_FRAMES} from './styles/Gag9';
import {Gag10, GAG10_FRAMES} from './styles/Gag10';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Gag9" component={Gag9} width={1080} height={1920} fps={30} durationInFrames={GAG9_FRAMES} />
    <Composition id="Gag10" component={Gag10} width={1080} height={1920} fps={30} durationInFrames={GAG10_FRAMES} />
  </>
);
