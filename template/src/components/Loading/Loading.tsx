import "./Loading.css";
import React, { FC, ReactNode } from "react";

type props = {
  children?: ReactNode;
  bgOpacity?: Boolean;
};
const Loading: FC<props> = ({ bgOpacity = true }) => {
  return (
    <>
      <div
        className={`components-loading ${
          bgOpacity ? "components-loading-opacity" : ""
        }`}
      >
      <div className="loading-con">
      <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
      </div>
      </div>
    </>
  );
};

export default Loading;