import React from "react";
function Pre(props) {
  return <div id={props.load ? "preloader" : "preloader-none"}></div>;// Загрузка анімації загрузки
}

export default Pre;
