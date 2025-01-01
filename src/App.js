import logo from "./logo.svg";
import "./App.css";
import { MyForm } from "./components/form/index";
import { DynamicForm } from "./components/form/dynamicForm";
import {Wave} from "./components/wave";
import BarChart from "./components/chart/bar";
import { useEffect } from "react";
import boomJS from "webgl-boom-js";
import * as THREE from "three";
import BlockNoteDemo from "./components/blocknote";
window.THREE = THREE; // 为 SPE 设置全局 THREE 变量

function App() {
  // useEffect(() => {
  //   document.body.addEventListener("click", (e) => {
  //     const ele = e.target ;
  //     boomJS(ele, );
  //   });
  // }, []);
  return (
    <div className="App">
      <header className="App-header">
        {/* <MyForm /> */}
        {/* <DynamicForm /> */}
        {/* <BarChart /> */}
{/* <Wave /> */}
<BlockNoteDemo />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
