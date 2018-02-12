import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';

import { Hello } from "./components/Help";

ReactDOM.render(
    <BrowserRouter>
        <Hello compiler="TypeScript" framework="React" />
    </BrowserRouter>,
    document.getElementById("app")
);