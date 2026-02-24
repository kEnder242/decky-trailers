import { definePlugin, routerHook } from "@decky/api";
import { afterPatch, findInReactTree, createReactTreePatcher, appDetailsClasses } from "@decky/ui";
import { FaVideo } from "react-icons/fa";
import * as React from "react";
import { ReactElement } from "react";
import { GameTrailer } from "./components/GameTrailer";

const logger = {
    info: (...args: any[]) => console.log("%c [Trailers] %c Info %c", "background: #16a085; color: black;", "background: #1abc9c; color: black;", "background: transparent;", ...args),
};

export default definePlugin(() => {
  const BUILD_VERSION = "v0.1.41";
  const BUILD_TIME = "1:10 AM";
  logger.info(`Initializing ${BUILD_VERSION} [${BUILD_TIME}] (Final Navigation Polish)`);

  let patch: any;

  try {
      patch = routerHook.addPatch("/library/app/:appid", (tree: any) => {
          const routeProps = findInReactTree(tree, (x: any) => x?.renderFunc);
          if (!routeProps) return tree;

          const patchHandler = createReactTreePatcher([
              (tree: any) => findInReactTree(tree, (x: any) => x?.props?.children?.props?.overview)?.props?.children
          ], (_: any[], ret: ReactElement) => {
              
              const appId = findInReactTree(ret, (n) => n?.props?.overview?.appid)?.props?.overview?.appid || 
                            parseInt(window.location.pathname.match(/\/library\/app\/(\d+)/)?.[1] || "0");

              if (!appId) return ret;

              const container = findInReactTree(ret, (x: any) => 
                  Array.isArray(x?.props?.children) && 
                  x?.props?.className?.includes(appDetailsClasses.InnerContainer)
              );

              if (container && Array.isArray(container.props.children)) {
                  const children = container.props.children;
                  const alreadyInjected = children.some((c: any) => c?.type === GameTrailer);
                  
                  if (!alreadyInjected) {
                      // THE WINNER: Index 2 is navigable and sits right above the Action Bar.
                      // We use splice to stay in the spatial flow.
                      children.splice(2, 0, <GameTrailer appId={appId} />);
                      logger.info(`Injected Winner at Index 2 for ${appId}`);
                  }
              }

              return ret;
          });

          afterPatch(routeProps, "renderFunc", patchHandler);
          return tree;
      });
  } catch (e) { console.error(e); }

  return {
    name: "Decky Trailers",
    title: <div>Decky Trailers</div>,
    icon: <FaVideo />,
    onDismount() { if (patch) routerHook.removePatch("/library/app/:appid", patch); },
  };
});