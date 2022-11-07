import { VFC } from 'react';

// this will be blurry unless you're on 1x UI scale cause the quick access menu icons arent being scaled pixel perfect :(
const MenuIcon: VFC = () => <svg
  xmlns="http://www.w3.org/2000/svg"
  xmlSpace="preserve"
  viewBox="0 0 16 16"
  stroke="transparent"
  fill="currentColor"
  height="1em"
  width="1em"
>
  <path d="M0,3L0,11L1,11L1,4L12,4L12,3L0,3Z"/>
  <path d="M14,5L2,5L2,12L3,12L3,6L14,6L14,5Z"/>
  <rect x="4" y="7" width="12" height="6"/>
</svg>;

export default MenuIcon;

