#!/bin/bash
cd /home/user/wg/el/proj/src
{ echo "import React from 'react';"; echo "import {Composition} from 'remotion';"
for f in styles/Gag*.tsx; do n=$(basename $f .tsx); u=$(echo $n | tr a-z A-Z); echo "import {$n, ${u}_FRAMES} from './styles/$n';"; done
echo "export const RemotionRoot: React.FC = () => (<>"
for f in styles/Gag*.tsx; do n=$(basename $f .tsx); u=$(echo $n | tr a-z A-Z); echo "  <Composition id=\"$n\" component={$n} width={1080} height={1920} fps={30} durationInFrames={${u}_FRAMES} />"; done
echo "</>);"; } > Root.tsx
