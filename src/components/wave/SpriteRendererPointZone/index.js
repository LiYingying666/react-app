import { Nebula } from '../primitives';
// import Nebula, { SpriteRenderer } from "three-nebula";

import React from 'react';
import { getSrcHref } from '../utils';
import init from './init';

const PointRender = () => (
  <Nebula srcHref={getSrcHref('SpriteRendererPointZone/init.js')} init={init} />
);
export default PointRender;