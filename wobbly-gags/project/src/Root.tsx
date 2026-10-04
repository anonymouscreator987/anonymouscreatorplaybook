import React from 'react';
import {Composition} from 'remotion';
import {Gag10, GAG10_FRAMES} from './styles/Gag10';
import {Gag11, GAG11_FRAMES} from './styles/Gag11';
import {Gag12, GAG12_FRAMES} from './styles/Gag12';
import {Gag9, GAG9_FRAMES} from './styles/Gag9';
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Gag10" component={Gag10} width={1080} height={1920} fps={30} durationInFrames={GAG10_FRAMES} />
  <Composition id="Gag11" component={Gag11} width={1080} height={1920} fps={30} durationInFrames={GAG11_FRAMES} />
  <Composition id="Gag12" component={Gag12} width={1080} height={1920} fps={30} durationInFrames={GAG12_FRAMES} />
  <Composition id="Gag9" component={Gag9} width={1080} height={1920} fps={30} durationInFrames={GAG9_FRAMES} />
</>);
