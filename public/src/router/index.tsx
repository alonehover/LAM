import * as React from "react"
import {
    Switch,
    Route,
    Redirect
} from "react-router-dom";

import routes from "./config"

const Root = () => {
    return (
        <Switch>
            {
                routes.map((route: any, k: number) => {
                    return (<Route exact={route.exact} path={route.path} key={k} component={route.component} />);
                })
            }
            <Redirect from='*' to='/' />
        </Switch>
    )
}