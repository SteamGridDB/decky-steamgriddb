import { VFC } from 'react';

const BoopIcon: VFC<any> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    fillRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit="2"
    clipRule="evenodd"
    viewBox="0 0 350 350"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M350 169v6A175 175 0 1 1 179 0a163 163 0 1 0 171 169Z" />
    <path d="M198 0h133c11 0 19 8 19 19v133A152 152 0 1 1 198 0Z" />
  </svg>
);

export default BoopIcon;

