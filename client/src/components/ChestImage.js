import React from 'react';
import { Box } from '@mui/material';
import silverBox from '../assets/box/silver.png';
import goldBox from '../assets/box/gold.png';
import platinumBox from '../assets/box/platinum.png';
import diamondBox from '../assets/box/diamond.png';
import masterBox from '../assets/box/master.png';
import eliteBox from '../assets/box/elite.png';

const chestImages = {
  SILVER: silverBox,
  GOLD: goldBox,
  PLATINUM: platinumBox,
  DIAMOND: diamondBox,
  MASTER: masterBox,
  ELITE: eliteBox
};

const ChestImage = ({ type, size = 100 }) => {
  return (
    <Box
      component="img"
      src={chestImages[type]}
      alt={`${type} Chest`}
      sx={{
        width: size,
        height: 'auto',
        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
        transform: 'scale(1.2)',
        opacity: 0.9,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ChestImage; 