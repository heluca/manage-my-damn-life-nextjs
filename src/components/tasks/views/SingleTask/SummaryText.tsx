import { isDarkModeEnabled } from '@/helpers/frontend/theme';
import { useEffect, useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export const SummaryText = ({text, color}: {text: string | undefined, color?: string}) =>{

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
          {text}
        </Tooltip>
      );
    
      const style={
        
      }
      return (
        <OverlayTrigger
          placement="top"
          overlay={renderTooltip}
        >
         <span>
         <div style={{color:color, wordBreak: "break-word", whiteSpace: "normal", zIndex:-999 }} className="textDefault">
          {text}
          </div>
          </span>
        </OverlayTrigger>
      );
}