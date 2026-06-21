import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface IllustrationProps {
  type:
    | 'upload'
    | 'analyze'
    | 'match'
    | 'cover-letter'
    | 'dream-job'
    | 'upload-resume'
    | 'crown';
  width?: number;
  height?: number;
}

export function Illustration({ type, width = 220, height = 200 }: IllustrationProps) {
  const stroke = Colors.text;
  const accent = Colors.primary;

  switch (type) {
    case 'upload':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <Circle cx="110" cy="60" r="22" stroke={stroke} strokeWidth="2" fill="none" />
          <Path d="M90 95 Q110 75 130 95" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="70" y="100" width="80" height="60" rx="4" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="130" y="120" width="50" height="35" rx="3" stroke={accent} strokeWidth="2" fill={Colors.primaryLight} />
          <Line x1="145" y1="128" x2="165" y2="128" stroke={accent} strokeWidth="2" />
          <Line x1="145" y1="136" x2="160" y2="136" stroke={accent} strokeWidth="2" />
          <Path d="M60 160 L160 160" stroke={stroke} strokeWidth="2" />
        </Svg>
      );
    case 'analyze':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <Rect x="60" y="50" width="50" height="60" rx="8" stroke={stroke} strokeWidth="2" fill="none" />
          <Circle cx="85" cy="65" r="8" stroke={accent} strokeWidth="2" fill={Colors.primaryLight} />
          <Rect x="75" y="78" width="20" height="3" rx="1" fill={stroke} />
          <Rect x="75" y="86" width="15" height="3" rx="1" fill={stroke} />
          <Rect x="120" y="60" width="70" height="90" rx="10" stroke={stroke} strokeWidth="2" fill="none" />
          <Circle cx="145" cy="85" r="10" stroke={accent} strokeWidth="2" fill={Colors.primaryLight} />
          <Path d="M135 100 L145 110 L160 90" stroke={accent} strokeWidth="2" fill="none" />
          <Circle cx="165" cy="75" r="6" fill={accent} />
          <Path d="M163 75 L165 77 L169 73" stroke="white" strokeWidth="1.5" fill="none" />
        </Svg>
      );
    case 'match':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <Circle cx="80" cy="70" r="20" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="55" y="100" width="50" height="55" rx="4" stroke={stroke} strokeWidth="2" fill="none" />
          <Circle cx="150" cy="100" r="35" stroke={accent} strokeWidth="3" fill="none" />
          <Line x1="175" y1="125" x2="195" y2="145" stroke={accent} strokeWidth="4" />
          <Rect x="120" y="55" width="60" height="40" rx="4" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="128" y="63" width="44" height="4" rx="1" fill={accent} />
          <Rect x="128" y="72" width="30" height="3" rx="1" fill={stroke} />
        </Svg>
      );
    case 'cover-letter':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <Circle cx="90" cy="55" r="18" stroke={stroke} strokeWidth="2" fill="none" />
          <Path d="M65 85 Q90 70 115 85" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="55" y="88" width="70" height="50" rx="4" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="110" y="70" width="70" height="90" rx="4" stroke={stroke} strokeWidth="2" fill="none" />
          <Line x1="120" y1="85" x2="170" y2="85" stroke={accent} strokeWidth="2" />
          <Line x1="120" y1="95" x2="160" y2="95" stroke={stroke} strokeWidth="1.5" />
          <Line x1="120" y1="105" x2="165" y2="105" stroke={stroke} strokeWidth="1.5" />
          <Path d="M130 130 L150 145" stroke={accent} strokeWidth="2" />
        </Svg>
      );
    case 'dream-job':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <Path d="M80 150 L110 60 L140 150 Z" stroke={accent} strokeWidth="2" fill={Colors.primaryLight} />
          <Circle cx="110" cy="55" r="8" fill={accent} />
          <Circle cx="70" cy="90" r="15" stroke={stroke} strokeWidth="2" fill="none" />
          <Path d="M55 110 Q70 95 85 110" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="55" y="112" width="30" height="35" rx="3" stroke={stroke} strokeWidth="2" fill="none" />
          <Path d="M60 160 Q110 140 160 160" stroke={stroke} strokeWidth="2" fill="none" />
        </Svg>
      );
    case 'upload-resume':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <Circle cx="110" cy="45" r="18" stroke={stroke} strokeWidth="2" fill="none" />
          <Path d="M85 70 Q110 55 135 70" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="85" y="72" width="50" height="40" rx="3" stroke={stroke} strokeWidth="2" fill="none" />
          <Rect x="60" y="120" width="100" height="60" rx="8" stroke={accent} strokeWidth="2" strokeDasharray="6 4" fill={Colors.primaryLight} />
          <Path d="M110 135 L110 155 M100 145 L110 135 L120 145" stroke={accent} strokeWidth="2" fill="none" />
        </Svg>
      );
    case 'crown':
      return (
        <Svg width={width} height={height} viewBox="0 0 220 200">
          <G>
            <Path
              d="M50 130 L70 70 L110 100 L150 70 L170 130 Z"
              fill={accent}
              stroke={accent}
              strokeWidth="2"
            />
            <Rect x="45" y="130" width="130" height="20" rx="4" fill={accent} />
            <Circle cx="70" cy="70" r="6" fill={Colors.primaryDark} />
            <Circle cx="110" cy="55" r="8" fill={Colors.primaryDark} />
            <Circle cx="150" cy="70" r="6" fill={Colors.primaryDark} />
          </G>
        </Svg>
      );
    default:
      return null;
  }
}
