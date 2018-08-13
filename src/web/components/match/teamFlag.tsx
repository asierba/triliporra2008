import * as React from 'react';

const smallStyle = {
  width : '30px'
};
const regularStyle = {
  height: '60px'
};

export default function TeamFlag(props) {
  const teamName = props.name.replace(' ','-');
  const src = `images/flags/${teamName}.png`;
  const alt = `flag ${teamName}`;

  const style = props.small ? smallStyle : regularStyle;
  return <img alt={alt} src={src} style={style} />;
}
