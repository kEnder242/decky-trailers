import { definePlugin, routerHook } from "@decky/api";
import { afterPatch, findInReactTree, createReactTreePatcher, appDetailsClasses } from "@decky/ui";
import { FaVideo } from "react-icons/fa";
import * as React from "react";
import { ReactElement } from "react";
import { GameTrailer } from "./components/GameTrailer";

const logger = {
    info: (...args: any[]) => console.log("%c Decky Trailers %c Info %c", "background: #16a085; color: black;", "background: #1abc9c; color: black;", "background: transparent;", ...args),
};

export default definePlugin(() => {
  const BUILD_TIME = "12:10 AM"; // Manual timestamp check
  logger.info(`Initializing v0.1.33 [${BUILD_TIME}] (The No-Portal Build)`);

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
                  const alreadyInjected = container.props.children.some((c: any) => c?.type === GameTrailer);
                  if (!alreadyInjected) {
                      logger.info(`Injecting v0.1.33 into InnerContainer for AppID ${appId}`);
                      container.props.children.unshift(<GameTrailer appId={appId} />);
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